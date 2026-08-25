from sqlalchemy import desc
from sqlalchemy.orm import Session
from datetime import date, datetime
from typing import Optional, List
import models
import schemas
import backend.app.auth as auth

# User operations
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        monthly_budget=1000.0  # Default budget
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_budget(db: Session, user_id: int, budget: float):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db_user.monthly_budget = budget
        db.commit()
        db.refresh(db_user)
    return db_user

# Expense operations
def get_expenses(
    db: Session,
    user_id: int,
    category: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    sort_by: str = "date_desc"
) -> List[models.Expense]:
    query = db.query(models.Expense).filter(models.Expense.user_id == user_id)
    
    if category and category.strip() != "":
        query = query.filter(models.Expense.category == category)
        
    if search and search.strip() != "":
        query = query.filter(
            (models.Expense.title.ilike(f"%{search}%")) |
            (models.Expense.description.ilike(f"%{search}%"))
        )
        
    if start_date:
        query = query.filter(models.Expense.date >= start_date)
        
    if end_date:
        query = query.filter(models.Expense.date <= end_date)
        
    # Apply sorting
    if sort_by == "date_asc":
        query = query.order_by(models.Expense.date.asc())
    elif sort_by == "amount_desc":
        query = query.order_by(models.Expense.amount.desc())
    elif sort_by == "amount_asc":
        query = query.order_by(models.Expense.amount.asc())
    else:  # default date_desc
        query = query.order_by(models.Expense.date.desc())
        
    return query.all()

def create_expense(db: Session, expense: schemas.ExpenseCreate, user_id: int) -> models.Expense:
    db_expense = models.Expense(
        title=expense.title,
        amount=expense.amount,
        category=expense.category,
        date=expense.date,
        description=expense.description,
        user_id=user_id
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

def update_expense(db: Session, expense_id: int, expense: schemas.ExpenseCreate, user_id: int) -> Optional[models.Expense]:
    db_expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.user_id == user_id
    ).first()
    
    if db_expense:
        db_expense.title = expense.title
        db_expense.amount = expense.amount
        db_expense.category = expense.category
        db_expense.date = expense.date
        db_expense.description = expense.description
        db.commit()
        db.refresh(db_expense)
    return db_expense

def delete_expense(db: Session, expense_id: int, user_id: int) -> bool:
    db_expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.user_id == user_id
    ).first()
    
    if db_expense:
        db.delete(db_expense)
        db.commit()
        return True
    return False

# Dashboard Summary
def get_dashboard_summary(db: Session, user: models.User) -> schemas.DashboardSummary:
    # 1. Calculate current month's expenses
    today = date.today()
    start_of_month = date(today.year, today.month, 1)
    
    monthly_expenses = db.query(models.Expense).filter(
        models.Expense.user_id == user.id,
        models.Expense.date >= start_of_month
    ).all()
    
    total_spent = sum(e.amount for e in monthly_expenses)
    remaining_budget = user.monthly_budget - total_spent
    
    # 2. Category breakdown for current month
    category_totals = {}
    for e in monthly_expenses:
        category_totals[e.category] = category_totals.get(e.category, 0.0) + e.amount
        
    breakdown = []
    for cat, amt in category_totals.items():
        pct = (amt / total_spent * 100.0) if total_spent > 0 else 0.0
        breakdown.append(schemas.CategorySummary(
            category=cat,
            amount=amt,
            percentage=round(pct, 2)
        ))
    
    # Sort breakdown by amount descending
    breakdown.sort(key=lambda x: x.amount, reverse=True)
    
    # 3. Recent activity (last 10 expenses overall, not just current month)
    recent_activity = db.query(models.Expense).filter(
        models.Expense.user_id == user.id
    ).order_by(models.Expense.date.desc()).limit(10).all()
    
    return schemas.DashboardSummary(
        total_spent=total_spent,
        monthly_budget=user.monthly_budget,
        remaining_budget=remaining_budget,
        category_breakdown=breakdown,
        recent_activity=recent_activity
    )
