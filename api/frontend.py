#!/usr/bin/env python3
"""
Frontend routes for serving HTML templates.
"""
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

router = APIRouter()
templates = Jinja2Templates(directory="templates")


@router.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Serves the landing page."""
    return templates.TemplateResponse("landing.html", {"request": request})


@router.get("/chat", response_class=HTMLResponse)
async def chat_interface(request: Request):
    """Serves the chat interface."""
    return templates.TemplateResponse("chat.html", {"request": request})


@router.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    """Serves the registration page."""
    return templates.TemplateResponse("register.html", {"request": request})


@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    """Serves the login page."""
    return templates.TemplateResponse("login.html", {"request": request})


@router.get("/dashboard", response_class=HTMLResponse)
async def dashboard_page(request: Request):
    """Serves the user dashboard."""
    return templates.TemplateResponse("user_dashboard.html", {"request": request})


@router.get("/services", response_class=HTMLResponse)
async def services_page(request: Request):
    """Serves the service selection page."""
    return templates.TemplateResponse("services.html", {"request": request})


@router.get("/verifications", response_class=HTMLResponse)
async def verifications_page(request: Request):
    """Serves the verification history page."""
    return templates.TemplateResponse("verifications.html", {"request": request})


@router.get("/numbers", response_class=HTMLResponse)
async def numbers_page(request: Request):
    """Serves the phone numbers marketplace."""
    return templates.TemplateResponse("numbers.html", {"request": request})


@router.get("/communication", response_class=HTMLResponse)
async def communication_dashboard(request: Request):
    """Serves the communication dashboard with SMS sending and AI assistance."""
    return templates.TemplateResponse(
        "communication_dashboard.html", {"request": request}
    )


@router.get("/routing", response_class=HTMLResponse)
async def international_routing(request: Request):
    """Serves the international routing interface for cost optimization."""
    return templates.TemplateResponse(
        "international_routing.html", {"request": request}
    )


@router.get("/billing", response_class=HTMLResponse)
async def billing_page(request: Request):
    """Serves the billing and credits page."""
    return templates.TemplateResponse("billing.html", {"request": request})


@router.get("/admin", response_class=HTMLResponse)
async def admin_page(request: Request):
    """Serves the admin dashboard."""
    return templates.TemplateResponse("admin.html", {"request": request})
