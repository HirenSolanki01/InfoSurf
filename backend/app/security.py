import os
import hashlib
from datetime import datetime, timedelta
from typing import Union, Any
import jwt
from app.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        salt_hex, hash_hex = hashed_password.split(":")
        salt = bytes.fromhex(salt_hex)
        stored_hash = bytes.fromhex(hash_hex)
        # Compute hash with the same salt and iterations
        test_hash = hashlib.pbkdf2_hmac(
            "sha256", 
            plain_password.encode("utf-8"), 
            salt, 
            100000
        )
        return test_hash == stored_hash
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    # Generate random 16-byte salt
    salt = os.urandom(16)
    # Compute SHA256 PBKDF2 hash with 100,000 iterations
    key = hashlib.pbkdf2_hmac(
        "sha256", 
        password.encode("utf-8"), 
        salt, 
        100000
    )
    # Format as salt_hex:hash_hex
    return f"{salt.hex()}:{key.hex()}"

def create_access_token(subject: Union[str, Any], user_id: int, expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "user_id": user_id
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    try:
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return decoded_token if decoded_token["exp"] >= datetime.utcnow().timestamp() else None
    except jwt.PyJWTError:
        return None
