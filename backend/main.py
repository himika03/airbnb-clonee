from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import supabase

app = FastAPI(title="Airbnb Clone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "FastAPI Backend Running 🚀"}

@app.get("/listings")
def get_listings():
    response = (
        supabase
        .table("listings")
        .select("*")
        .eq("is_active", True)
        .execute()
    )

    return response.data

@app.get("/profiles")
def get_profiles():
    response = (
        supabase
        .table("profiles")
        .select("*")
        .execute()
    )

    return response.data

@app.get("/reviews")
def get_reviews():
    response = (
        supabase
        .table("reviews")
        .select("*")
        .execute()
    )

    return response.data

@app.get("/bookings")
def get_bookings():
    response = (
        supabase
        .table("bookings")
        .select("*")
        .execute()
    )

    return response.data