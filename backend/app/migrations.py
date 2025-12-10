"""Database migration scripts.

This module contains migration functions to update the database schema.
Run migrations before deploying changes that modify the database structure.
"""

from sqlalchemy import inspect, text
from sqlalchemy.engine import make_url
from app.database import engine, DATABASE_URL
import logging

logger = logging.getLogger(__name__)


def make_columns_nullable():
    """
    Migration: Make address and emergency_contact columns nullable in patients table.
    
    This migration ensures that existing databases created before these fields
    were made nullable are updated to allow NULL values.
    
    IMPORTANT: Run this migration before deploying code changes that expect
    these fields to be nullable, otherwise the application will fail when
    trying to create records with NULL values.
    """
    database_url = make_url(DATABASE_URL)
    is_sqlite = database_url.drivername.lower() == "sqlite"
    
    with engine.connect() as conn:
        inspector = inspect(engine)
        
        # Check if patients table exists
        if "patients" not in inspector.get_table_names():
            logger.warning("patients table does not exist. Skipping migration.")
            return
        
        # Get column information
        columns = {col['name']: col for col in inspector.get_columns('patients')}
        
        if is_sqlite:
            # SQLite has limited ALTER TABLE support
            # Check if columns are already nullable (SQLite stores this in the schema)
            # For SQLite, we need to check the table definition
            # Since SQLite doesn't support ALTER COLUMN, we'll verify the current state
            # and log a warning if migration is needed
            
            address_col = columns.get('address')
            emergency_contact_col = columns.get('emergency_contact')
            
            if address_col and not address_col.get('nullable', True):
                logger.warning(
                    "SQLite detected: address column is NOT NULL. "
                    "SQLite does not support ALTER COLUMN. "
                    "You may need to recreate the table or use a migration tool. "
                    "For development, you can delete the database file to recreate it."
                )
            elif address_col:
                logger.info("address column is already nullable (SQLite)")
            
            if emergency_contact_col and not emergency_contact_col.get('nullable', True):
                logger.warning(
                    "SQLite detected: emergency_contact column is NOT NULL. "
                    "SQLite does not support ALTER COLUMN. "
                    "You may need to recreate the table or use a migration tool. "
                    "For development, you can delete the database file to recreate it."
                )
            elif emergency_contact_col:
                logger.info("emergency_contact column is already nullable (SQLite)")
            
            # For SQLite, if columns are already nullable, we're done
            if (not address_col or address_col.get('nullable', True)) and \
               (not emergency_contact_col or emergency_contact_col.get('nullable', True)):
                logger.info("Migration complete: address and emergency_contact are nullable")
                return
        
        else:
            # PostgreSQL and other databases support ALTER TABLE
            conn.execute(text("BEGIN"))
            try:
                # Check and alter address column
                address_col = columns.get('address')
                if address_col and not address_col.get('nullable', True):
                    logger.info("Making address column nullable...")
                    conn.execute(text("ALTER TABLE patients ALTER COLUMN address DROP NOT NULL"))
                    conn.commit()
                    logger.info("address column is now nullable")
                elif address_col:
                    logger.info("address column is already nullable")
                
                # Check and alter emergency_contact column
                emergency_contact_col = columns.get('emergency_contact')
                if emergency_contact_col and not emergency_contact_col.get('nullable', True):
                    logger.info("Making emergency_contact column nullable...")
                    conn.execute(text("ALTER TABLE patients ALTER COLUMN emergency_contact DROP NOT NULL"))
                    conn.commit()
                    logger.info("emergency_contact column is now nullable")
                elif emergency_contact_col:
                    logger.info("emergency_contact column is already nullable")
                
                logger.info("Migration complete: address and emergency_contact are nullable")
                
            except Exception as e:
                conn.rollback()
                logger.error(f"Migration failed: {e}")
                raise


if __name__ == "__main__":
    """Run migrations when script is executed directly."""
    logging.basicConfig(level=logging.INFO)
    logger.info("Starting database migration...")
    make_columns_nullable()
    logger.info("Migration completed.")
