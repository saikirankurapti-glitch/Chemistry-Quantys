import torch
import torch.nn as nn

class SMILESGenerator(nn.Module):
    """
    How the generative model works:
    1. Embedding Layer: Converts the integer ID of a token into a dense float vector.
    2. LSTM (Long Short-Term Memory) Layer: A recurrent neural network that processes 
       the sequence of embeddings one by one, maintaining a hidden state that represents 
       the context of tokens seen so far.
    3. Linear Output Layer: Maps the LSTM's hidden state at each step to the size of 
       the vocabulary, producing 'logits' (raw scores) for the next token prediction.
    4. Softmax (implicitly used in CrossEntropyLoss or during generation): Converts logits 
       into probabilities, indicating how likely each token is to appear next.
    """
    def __init__(self, vocab_size, embedding_dim=128, hidden_dim=256, num_layers=2, dropout=0.2):
        super(SMILESGenerator, self).__init__()
        self.vocab_size = vocab_size
        self.embedding_dim = embedding_dim
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        
        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        
        # We use batch_first=True so our inputs are (batch_size, sequence_length, embedding_dim)
        self.lstm = nn.LSTM(
            input_size=embedding_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            dropout=dropout if num_layers > 1 else 0,
            batch_first=True
        )
        
        self.fc = nn.Linear(hidden_dim, vocab_size)
        
    def forward(self, x, hidden=None):
        """
        Forward pass for training.
        x: Token indices of shape (batch, seq_len)
        Returns: logits of shape (batch, seq_len, vocab_size) and the hidden state
        """
        # (batch, seq_len) -> (batch, seq_len, embed_dim)
        embedded = self.embedding(x)
        
        # out: (batch, seq_len, hidden_dim)
        out, hidden = self.lstm(embedded, hidden)
        
        # logits: (batch, seq_len, vocab_size)
        logits = self.fc(out)
        
        return logits, hidden
