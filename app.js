const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

// In-memory database as an array as time constraints. 
//If I would have done using sql/mongodb then will have consider indexing.
let groceryItems = [
    { id: 'grocery1', name: 'Apple', price: 2.5, inventory: 20, role: 'admin' },
    { id: 'grocery2', name: 'Banana', price: 1.5, inventory: 30, role: 'admin' },
  ];
  
const users = [
  { id: '1', username: 'admin', password: 'adminPassword', role: 'admin' },
  { id: '2', username: 'user', password: 'userPassword', role: 'user' },
];
//Assuming that for user signup some API .
let orders = [];

// Secret key for JWT
const jwtSecretKey = 'everythingIsposs';

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Passport middleware setup
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecretKey,
}, (jwtPayload, done) => {
  // Check if the user exists or handle authorization logic
  const user = users.find(u => u.id === jwtPayload.sub);

  if (user) {
    return done(null, user);
  } else {
    return done(null, false, { message: 'User not found' });
  }
}));

// Middleware to check if the user is an admin
function isAdmin(req, res, next) {
  const userRole = req.user.role;

  if (userRole === 'admin') {
    return next();
  } else {
    return res.status(403).send('Permission denied. User is not an admin.');
  }
}

// Admin Endpoints
app.post('/admin/addGroceryItem', passport.authenticate('jwt', { session: false }), isAdmin, (req, res) => {
  const { name, price, inventory } = req.body;
  const newItem = { id: generateId(), name, price, inventory, role: 'admin' };

  groceryItems.push(newItem);

  res.status(201).json(newItem);
});

app.get('/admin/viewGroceryItems', passport.authenticate('jwt', { session: false }), isAdmin, (req, res) => {
  res.status(200).json(groceryItems);
});

app.delete('/admin/removeGroceryItem/:itemId', passport.authenticate('jwt', { session: false }), isAdmin, (req, res) => {
  const itemId = req.params.itemId;

  groceryItems = groceryItems.filter(item => item.id !== itemId);

  res.status(200).send('Grocery item removed successfully.');
});

app.put('/admin/updateGroceryItem/:itemId', passport.authenticate('jwt', { session: false }), isAdmin, (req, res) => {
  const itemId = req.params.itemId;
  const { name, price, inventory } = req.body;

  const index = groceryItems.findIndex(item => item.id === itemId);
  if (index !== -1) {
    groceryItems[index] = { ...groceryItems[index], name, price, inventory };
    res.status(200).send('Grocery item updated successfully.');
  } else {
    res.status(404).send('Grocery item not found.');
  }
});

app.put('/admin/manageInventory/:itemId', passport.authenticate('jwt', { session: false }), isAdmin, (req, res) => {
  const itemId = req.params.itemId;
  const { inventory } = req.body;

  const index = groceryItems.findIndex(item => item.id === itemId);
  if (index !== -1) {
    groceryItems[index] = { ...groceryItems[index], inventory };
    res.status(200).send('Inventory managed successfully.');
  } else {
    res.status(404).send('Grocery item not found.');
  }
});

// User Endpoints
app.get('/user/viewGroceryItems', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.status(200).json(groceryItems);//We should add pagination.
});

app.post('/user/bookGroceryItems', passport.authenticate('jwt', { session: false }), (req, res) => {
  const itemsToBook = req.body;

  // Check if each item is available in the inventory
  for (const item of itemsToBook) {
    const inventoryItem = groceryItems.find(groceryItem => groceryItem.id === item.id);

    if (!inventoryItem || inventoryItem.inventory < item.quantity) {
      return res.status(400).json({ message: `Item with ID ${item.id} is not available in sufficient quantity.` });
    }
  }

  // Update inventory levels and record the booking in the orders array
  for (const item of itemsToBook) {
    const index = groceryItems.findIndex(groceryItem => groceryItem.id === item.id);
    groceryItems[index].inventory -= item.quantity;

    // Record the booking information in the orders array
    orders.push({
      userId: req.user.id,
      itemId: item.id,
      itemName: groceryItems[index].name,
      quantity: item.quantity,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).send('Grocery items booked successfully.');
});


// Generate a JWT token for authentication
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;

  // Validate username and password
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    const token = jwt.sign({ sub: user.id, role: user.role }, jwtSecretKey, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Authentication failed' });
  }
});

// Helper function to generate unique IDs
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
module.exports = app;
