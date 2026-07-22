# pgAdmin Setup Guide

## Overview
pgAdmin is a web-based database management tool for PostgreSQL. This guide provides instructions for setting up pgAdmin to connect to the Inventory Management System database.

## Installation

### Windows
1. Download pgAdmin from: https://www.pgadmin.org/download/
2. Run the installer
3. Follow the installation steps

### macOS
```bash
brew install pgadmin4
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get install pgadmin4
```

## Configuration

### Connection Settings
Use the following credentials to connect to the project database:

- **Host**: localhost
- **Port**: 5432
- **Database**: inventar_management
- **Username**: postgres
- **Password**: postgres

### Steps to Add Server in pgAdmin
1. Open pgAdmin
2. Right-click on "Servers" in the left panel
3. Select "Create" > "Server"
4. In the "General" tab, enter a name (e.g., "Inventory Management")
5. In the "Connection" tab, enter:
   - Host: localhost
   - Port: 5432
   - Maintenance database: postgres
   - Username: postgres
   - Password: postgres
6. Click "Save"

## Database Setup
After connecting, create the database:
1. Right-click on "Databases"
2. Select "Create" > "Database"
3. Enter name: `inventar_management`
4. Click "Save"

## Notes
- The connection credentials match those in the `.env` file
- Ensure PostgreSQL server is running before connecting
- For production, use secure passwords and update the `.env` file accordingly
