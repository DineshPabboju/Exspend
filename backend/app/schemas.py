from pydantic import BaseModel
from datetime import date
from typing import Optional, Dict, List

# User Schemas
class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    monthly_budget: float

    class Config:
        from_attributes = True

# Budget Update Schema
class BudgetUpdate(BaseModel):
    monthly_budget: float

# Expense Schemas
class ExpenseBase(BaseModel):
    title: str
    amount: float
    category: str
    date: date
    description: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseResponse(ExpenseBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Summary Statistics Schema
class CategorySummary(BaseModel):
    category: str
    amount: float
    percentage: float

class DashboardSummary(BaseModel):
    total_spent: float
    monthly_budget: float
    remaining_budget: float
    category_breakdown: List[CategorySummary]
    recent_activity: List[ExpenseResponse]
