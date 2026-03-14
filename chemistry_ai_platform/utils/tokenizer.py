import re

def explain_tokenization():
    """
    Why molecules must be tokenized for machine learning?
    Machine learning models process numerical data. A SMILES string is just text.
    To allow a neural network to learn the grammar of SMILES and generate new valid sequences,
    we must break the strings down into fundamental units (tokens), such as atoms (C, O, N)
    or structural symbols ([, ], =, +, -). 
    After tokenizing, we assign a unique integer ID to each token.
    """
    pass

def tokenize_smiles(smiles_str):
    """
    Tokenize a SMILES string into a list of characters/tokens.
    Usually we can handle individual characters, but elements like 'Cl' and 'Br' 
    should ideally be single tokens. For simplicity, we use a regex or character level.
    """
    pattern = r"(\[.*?\]|Br|Cl|Si|Se|Te|B|C|N|O|P|S|F|I|b|c|n|o|p|s|f|i|\(|\)|\.|=|#|-|\+|\\\\|\/|:|~|@|\?|>|<|\*|\$|\%[0-9]{2}|[0-9])"
    regex = re.compile(pattern)
    tokens = [token for token in regex.findall(smiles_str)]
    return tokens

def build_vocabulary(smiles_list):
    """
    Create a vocabulary mapping from token to integer ID and vice-versa.
    We also add special tokens for start sequence, end sequence, and padding.
    """
    vocab = set()
    for smi in smiles_list:
        tokens = tokenize_smiles(smi)
        vocab.update(tokens)
        
    vocab = sorted(list(vocab))
    special_tokens = ['<PAD>', '<START>', '<END>', '<UNK>']
    vocab = special_tokens + vocab
    
    token_to_id = {token: i for i, token in enumerate(vocab)}
    id_to_token = {i: token for i, token in enumerate(vocab)}
    
    return token_to_id, id_to_token

def encode_smiles(smiles_str, token_to_id, max_length=None):
    """
    Convert a tokenized SMILES into a numeric sequence.
    Example: ['C','C','O'] -> [0,0,1]
    """
    tokens = tokenize_smiles(smiles_str)
    # Wrap in start and end tokens
    encoded = [token_to_id['<START>']]
    for t in tokens:
        encoded.append(token_to_id.get(t, token_to_id['<UNK>']))
    encoded.append(token_to_id['<END>'])
    
    if max_length is not None:
        if len(encoded) < max_length:
            encoded += [token_to_id['<PAD>']] * (max_length - len(encoded))
        else:
            encoded = encoded[:max_length]
            # Ensure the last token is <END> if truncated
            encoded[-1] = token_to_id['<END>']
            
    return encoded

def decode_smiles(encoded_seq, id_to_token):
    """
    Convert a numeric sequence back into a SMILES string.
    """
    tokens = []
    for idx in encoded_seq:
        idx_val = int(idx)
        token = id_to_token.get(idx_val, '')
        if token in ['<START>', '<PAD>']:
            continue
        if token == '<END>':
            break
        tokens.append(token)
    return ''.join(tokens)
