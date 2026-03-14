import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import json
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml_models.generative_model import SMILESGenerator

def train():
    """
    Step 6: Train the generative model to predict the next token in the SMILES sequence.
    """
    data_path = 'datasets/encoded_smiles.pt'
    vocab_path = 'datasets/vocab.json'
    
    if not os.path.exists(data_path) or not os.path.exists(vocab_path):
        print("Data or vocab not found. Run encode_dataset.py first.")
        return
        
    print("Loading data...")
    # shape: (num_samples, seq_len)
    dataset_tensor = torch.load(data_path)
    
    with open(vocab_path, 'r') as f:
        vocab = json.load(f)
    vocab_size = len(vocab)
    
    # We want to predict the next token. 
    # Input is sequence[:-1], Target is sequence[1:]
    # Because of padding, we just shift by 1.
    X = dataset_tensor[:, :-1]
    y = dataset_tensor[:, 1:]
    
    dataset = TensorDataset(X, y)
    batch_size = 128
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    model = SMILESGenerator(vocab_size=vocab_size, embedding_dim=128, hidden_dim=256, num_layers=2)
    model.to(device)
    
    # Ignore the <PAD> token in loss calculation
    pad_idx = vocab.get('<PAD>', 0)
    criterion = nn.CrossEntropyLoss(ignore_index=pad_idx)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    
    epochs = 5  # Keeping it small for demonstration
    print("Starting training loop...")
    
    for epoch in range(epochs):
        model.train()
        total_loss = 0
        
        for batch_idx, (b_x, b_y) in enumerate(dataloader):
            b_x, b_y = b_x.to(device), b_y.to(device)
            
            optimizer.zero_grad()
            
            # Forward pass
            logits, _ = model(b_x)
            
            # Reshape for CrossEntropyLoss: (batch * seq_len, vocab_size)
            logits = logits.view(-1, vocab_size)
            b_y = b_y.contiguous().view(-1)
            
            loss = criterion(logits, b_y)
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
            
            if batch_idx % 20 == 0:
                print(f"Epoch {epoch+1}/{epochs} | Batch {batch_idx}/{len(dataloader)} | Loss: {loss.item():.4f}")
                
        avg_loss = total_loss / len(dataloader)
        print(f"--- Epoch {epoch+1} completed. Average Loss: {avg_loss:.4f} ---")
        
    os.makedirs('experiments', exist_ok=True)
    checkpoint_path = 'experiments/generative_model_ckpt.pt'
    torch.save(model.state_dict(), checkpoint_path)
    print(f"Model saved to {checkpoint_path}")

if __name__ == "__main__":
    train()
