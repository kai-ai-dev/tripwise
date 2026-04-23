from fastapi import Header, HTTPException

async def verify_token(authorization: str = Header(...)):
    """校验 Supabase JWT token，从 Authorization: Bearer <token> 中提取"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.split(" ")[1]
    # TODO: 用 supabase.auth.get_user(token) 校验
    return token
