This project is the backend of an inventory management system designed for restaurants, built using Node.js, Express, and Sequelize. It provides RESTful APIs for managing inventory, user authentication, and other related functionalities.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Build and Deployment](#build-and-deployment)

## Features

- **User Authentication**: Register and login users with JWT-based authentication.
- **Inventory Management**: Manage inventory items and track stock levels.
- **Email Notifications**: Send email notifications for low-stock alerts and order confirmations.
- **Asynchronous Job Processing**: Use Bull for processing background jobs such as sending emails.
- **Secure Environment**: Manage configuration using environment variables with dotenv.

## Technologies Used

- **Node.js**: JavaScript runtime for building server-side applications.
- **Express**: Web framework for Node.js.
- **Sequelize**: Promise-based Node.js ORM for MySQL.
- **JWT**: JSON Web Token for user authentication.
- **Nodemailer**: Library for sending emails.
- **Bull**: Queue library for handling background jobs.
- **TypeScript**: Typed JavaScript for better development experience.

## Getting Started

To get started with the backend project, clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd inventory-server
npm install
