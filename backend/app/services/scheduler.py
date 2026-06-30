# app/services/scheduler.py
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.services.expiration_service import ExpirationService
import logging

logger = logging.getLogger(__name__)

def run_expiration_check():
    """Run expiration check for coins and purchases"""
    db = SessionLocal()
    try:
        ExpirationService.run_expiration_check(db, background_tasks=None)
        logger.info("Expiration check completed successfully")
    except Exception as e:
        logger.error(f"Error in expiration check: {e}")
    finally:
        db.close()

def start_scheduler():
    """Start the background scheduler"""
    scheduler = BackgroundScheduler()
    
    # Run expiration check every hour
    scheduler.add_job(
        run_expiration_check,
        trigger=IntervalTrigger(hours=1),
        id='expiration_check',
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("Scheduler started with hourly expiration checks")
    return scheduler