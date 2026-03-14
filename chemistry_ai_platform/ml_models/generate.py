import torch
import torch.nn.functional as F

def generate_molecule(model, token_to_id, id_to_token, max_len=100, temperature=1.0, seed_token='<START>'):
    """
    Step 7: Molecule Generation
    1. Start with seed token (<START>)
    2. Predict next token probabilities
    3. Sample from probabilities
    4. Append token and repeat until <END> or max_len
    5. Convert back to SMILES using id_to_token
    """
    device = next(model.parameters()).device
    model.eval()
    
    # Initialize sequence with start token
    current_token_id = token_to_id.get(seed_token, token_to_id['<START>'])
    input_seq = torch.tensor([[current_token_id]], dtype=torch.long).to(device)
    
    generated_tokens = []
    hidden = None
    
    with torch.no_grad():
        for _ in range(max_len):
            # Forward pass
            logits, hidden = model(input_seq, hidden)
            
            # Get logits for the last step
            next_token_logits = logits[0, -1, :] / temperature
            probs = F.softmax(next_token_logits, dim=-1)
            
            # Sample next token
            next_token_id = torch.multinomial(probs, num_samples=1).item()
            next_token = id_to_token[next_token_id]
            
            if next_token == '<END>':
                break
                
            generated_tokens.append(next_token)
            
            # Update input for next step
            input_seq = torch.tensor([[next_token_id]], dtype=torch.long).to(device)
            
    # Remove any padding or special tokens that might have sneaked in
    clean_tokens = [t for t in generated_tokens if t not in ['<START>', '<PAD>', '<END>', '<UNK>']]
    
    smiles = "".join(clean_tokens)
    return smiles
