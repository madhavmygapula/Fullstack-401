const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./castonekey.json');
const path = require('path'); 
const bcrypt = require('bcrypt');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-firebase-project-s-d7963.firebaseio.com',
});

const db = admin.firestore();
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store user data in Firestore with hashed password
    await db.collection('student_details').doc(username).set({
      username: username,
      password: hashedPassword,
    });

    res.send('Signup Successful!');
  } catch (error) {
    console.error('Error during signup:', error);
    res.send('Error during signup. Please try again.');
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Check if user exists in Firestore
  const userDoc = await db.collection('student_details').doc(username).get();

  if (userDoc.exists) {
    // Compare the entered password with the hashed password from Firestore
    const isPasswordValid = await bcrypt.compare(password, userDoc.data().password);

    if (isPasswordValid) {
      // Redirect to the Movies page after a successful login
      res.redirect('/easymove');
    } else {
      res.send('Invalid Password. Please try again.');
    }
  } else {
    res.send('Invalid Username. Please signup.');
  }
});
  // Route to render movies.ejs
app.get('/easymove', (req, res) => {
    res.render('easymove');
  });

  app.post('/easymove', (req, res) => {
    // Your form submission logic here
    // ...
  
    res.redirect('/easymove'); // Redirect to the movies page after form submission
  });
  app.get('/movies', (req, res) => {
    res.render('movies');
  });
  app.get('/Easyshop', (req, res) => {
    res.render('Easyshop');
  });


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
