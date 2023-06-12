# Uptime Monitoring App
This project is an uptime monitoring RESTful API server that allows authenticated users to monitor URLs and get detailed uptime reports about their availability, average response time, and total uptime/downtime.

# Overview
## 1. Signup with email verification 
* The user sign's up with his Username, Email and password, the server then send an email to user with a verification link to verify their account.

## 2. CRUD operations for URL check
*  Only the users who created the check can perform GET, PUT, and DELETE operations.

## 3. Notifications
* Authenticated users can receive notifications via email, webhook (optional) or pushover when one of their URLs goes down or goes back up.
* 
## 4. Uptime reports
* Authenticated users can access detailed uptime reports on their URLs, including data on availability, average response time, and total uptime/downtime.

## 5. Group checks by tags
* Users can group their checks by tags and generate reports by tag.

# Overview
## Getting Started
* 1. Clone this repository to your local machine.
* 2. Navigate to the project directory.
* 3. Run sudo docker-compose up to start the server.
* 4. Use the endpoints defined in the API documentation to interact with the server.

```