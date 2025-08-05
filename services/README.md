# API Service

This directory contains the centralized API service for the Gero POS application. The API service provides a consistent way to interact with the backend API across the entire application.

## Overview

The API service consists of:

1. A configured Axios instance with common settings
2. Request and response interceptors for handling authentication and errors
3. Organized API endpoints as functions grouped by resource type

## Usage

### Importing the API Service

```typescript
// Import the entire API service
import { api, endpoints } from '../services/api';

// Or import specific endpoints
import { endpoints } from '../services/api';
```

### Making API Calls

```typescript
// Using the endpoints object
const fetchProducts = async () => {
  try {
    const response = await endpoints.products.getAll();
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Creating an order
const createOrder = async (orderData) => {
  try {
    const response = await endpoints.orders.create(orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Checking server health
const checkServerHealth = async () => {
  try {
    const isHealthy = await endpoints.system.healthCheck()
      .then(() => true)
      .catch(() => false);
    return isHealthy;
  } catch (error) {
    return false;
  }
};
```

## Available Endpoints

The API service provides the following endpoint groups:

### System
- `endpoints.system.healthCheck()` - Check if the server is up and running

### Products
- `endpoints.products.getAll()` - Get all products
- `endpoints.products.getById(id)` - Get a product by ID
- `endpoints.products.create(data)` - Create a new product
- `endpoints.products.update(id, data)` - Update a product
- `endpoints.products.delete(id)` - Delete a product

### Clients
- `endpoints.clients.getAll()` - Get all clients
- `endpoints.clients.getById(id)` - Get a client by ID
- `endpoints.clients.create(data)` - Create a new client
- `endpoints.clients.update(id, data)` - Update a client
- `endpoints.clients.delete(id)` - Delete a client

### Orders
- `endpoints.orders.create(data)` - Create a new order
- `endpoints.orders.getById(id)` - Get an order by ID
- `endpoints.orders.getAll()` - Get all orders

### Authentication
- `endpoints.auth.login(credentials)` - Login with credentials
- `endpoints.auth.logout()` - Logout
- `endpoints.auth.refreshToken()` - Refresh the authentication token

## Configuration

The API service is configured with:

- Base URL: `http://wwsl.gero.test/api/v-classic`
- Default headers: `Content-Type: application/json`
- Timeout: 10 seconds

Authentication tokens are automatically added to requests from localStorage or a default value.

## Error Handling

The API service includes response interceptors that handle common error scenarios:

- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 500 Server Error

Errors are logged to the console and can be caught in your application code.