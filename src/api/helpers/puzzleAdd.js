// db.js

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');

dotenv.config();

// Import the Puzzle model
const Puzzle = require('../models/Puzzle'); // Adjust the path as necessary

// MongoDB connection URI
const mongoURI = process.env.MONGODB_URL; // Ensure this is set in your .env file

// Connect to MongoDB
mongoose.connect(mongoURI, { dbName: 'secRush' })
    .then(() => {
        console.log('Connected to MongoDB');

        // Define the array of vulnerable application codes
        const puzzles = [
            {
                code: `<?php
// search.php

// Database configuration
$servername = "localhost";
$username = "admin_user";
$password = "P@ssw0rd!23";
$dbname = "user_management";

// Create a connection to the MySQL database
$conn = new mysqli($servername, $username, $password, $dbname);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Retrieve the search term from the GET request
$searchTerm = $_GET['name'];

// Vulnerable SQL query susceptible to SQL Injection
$sql = "SELECT * FROM users WHERE name = '$searchTerm'";

$result = $conn->query($sql);

if ($result === false) {
    echo "Error: " . $conn->error;
} else {
    if ($result->num_rows > 0) {
        // Output data of each row
        while($row = $result->fetch_assoc()) {
            echo "ID: " . htmlspecialchars($row["id"]) . " - Name: " . htmlspecialchars($row["name"]) . "<br>";
        }
    } else {
        echo "0 results";
    }
}

$conn->close();
?>`,
                language: "php",
                vulnerableLine: 21, // Line where the SQL query is constructed
                difficulty: "medium"
            },
            {
                code: `// VulnerableJava.java

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Scanner;

public class VulnerableJava {
    public static void main(String[] args) {
        // Database configuration
        String url = "jdbc:mysql://localhost:3306/user_management";
        String user = "db_admin";
        String password = "S3cur3P@ssw0rd!";

        try {
            // Establish connection to the database
            Connection conn = DriverManager.getConnection(url, user, password);
            System.out.println("Connected to the database.");

            // Create a scanner to read user input
            Scanner scanner = new Scanner(System.in);
            System.out.print("Enter username to search: ");
            String searchUsername = scanner.nextLine();

            // Vulnerable SQL query susceptible to SQL Injection
            String query = "SELECT * FROM users WHERE username = '" + searchUsername + "'";

            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(query);

            // Process the result set
            while (rs.next()) {
                System.out.println("ID: " + rs.getInt("id") + " - Username: " + rs.getString("username"));
            }

            // Close resources
            rs.close();
            stmt.close();
            conn.close();
            scanner.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}`,
                language: "java",
                vulnerableLine: 16, // Line where the SQL query is constructed
                difficulty: "medium"
            },
            {
                code: `# vulnerable.py

import sqlite3
from flask import Flask, request, jsonify

app = Flask(__name__)

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect('user_management.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL
        )
    ''')
    # Insert sample data
    cursor.execute("INSERT INTO users (username) VALUES ('alice')")
    cursor.execute("INSERT INTO users (username) VALUES ('bob')")
    cursor.execute("INSERT INTO users (username) VALUES ('charlie')")
    conn.commit()
    conn.close()

@app.route('/search', methods=['GET'])
def search_user():
    search_username = request.args.get('username')

    # Vulnerable SQL query susceptible to SQL Injection
    query = f"SELECT * FROM users WHERE username = '{search_username}'"

    conn = sqlite3.connect('user_management.db')
    cursor = conn.cursor()
    cursor.execute(query)
    results = cursor.fetchall()
    conn.close()

    users = []
    for row in results:
        users.append({'id': row[0], 'username': row[1]})

    return jsonify(users)

if __name__ == '__main__':
    init_db()
    app.run(debug=True)`,
                language: "python",
                vulnerableLine: 16, // Line where the SQL query is constructed
                difficulty: "medium"
            },
            {
                code: `// app.js

const express = require('express');
const mysql = require('mysql');
const app = express();

// Create a connection to the database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'secure_user',
  password: 'Str0ngP@ssw0rd!',
  database: 'user_management'
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});

// Middleware to parse JSON data
app.use(express.json());

// Route to get user by email
app.get('/user', (req, res) => {
  const email = req.query.email;

  // Vulnerable SQL query susceptible to SQL Injection
  const query = \`SELECT * FROM users WHERE email = '\${email}'\`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(results);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
                language: "javascript",
                vulnerableLine: 15, // Line where the SQL query is constructed
                difficulty: "medium"
            },
            {
                code: `// UsersController.cs

using System;
using System.Data.SqlClient;
using System.Web.Mvc;

namespace YourApp.Controllers
{
    public class UsersController : Controller
    {
        public ActionResult Search(string username)
        {
            // Vulnerable SQL query susceptible to SQL Injection
            string query = "SELECT * FROM Users WHERE Username = '" + username + "'";

            string connectionString = "Server=localhost;Database=user_management;User Id=admin_user;Password=P@ssw0rd!23;";
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                SqlCommand cmd = new SqlCommand(query, conn);
                conn.Open();
                SqlDataReader reader = cmd.ExecuteReader();

                // Process results
                while (reader.Read())
                {
                    ViewBag.UserId = reader["Id"];
                    ViewBag.Username = reader["Username"];
                }
            }

            return View();
        }
    }
}`,
                language: "csharp",
                vulnerableLine: 10, // Line where the SQL query is constructed
                difficulty: "medium"
            },
            {
                code: `# vulnerable.rb

require 'sinatra'
require 'pg'

get '/search' do
  email = params['email']

  # Vulnerable SQL query susceptible to SQL Injection
  conn = PG.connect(dbname: 'user_management', user: 'db_admin', password: 'S3cur3P@ssw0rd!')
  result = conn.exec("SELECT * FROM users WHERE email = '#{email}'")

  users = result.map { |row| "ID: #{row['id']} - Email: #{row['email']}" }.join("<br>")
  conn.close

  users.empty? ? "No users found." : users
end`,
                language: "ruby",
                vulnerableLine: 11, // Line where the SQL query is constructed
                difficulty: "medium"
            },
            {
                code: `// vulnerable.go

package main

import (
    "database/sql"
    "fmt"
    "log"
    "net/http"

    _ "github.com/mattn/go-sqlite3"
)

func searchUser(w http.ResponseWriter, r *http.Request) {
    username := r.URL.Query().Get("username")

    // Vulnerable SQL query susceptible to SQL Injection
    query := fmt.Sprintf("SELECT * FROM users WHERE username = '%s'", username)

    db, err := sql.Open("sqlite3", "./user_management.db")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    rows, err := db.Query(query)
    if err != nil {
        fmt.Fprintf(w, "Error: %v", err)
        return
    }
    defer rows.Close()

    for rows.Next() {
        var id int
        var uname string
        err = rows.Scan(&id, &uname)
        if err != nil {
            log.Fatal(err)
        }
        fmt.Fprintf(w, "ID: %d - Username: %s<br>", id, uname)
    }
}

func main() {
    http.HandleFunc("/search", searchUser)
    fmt.Println("Server running on port 8080")
    log.Fatal(http.ListenAndServe(":8080", nil))
}`,
                language: "go",
                vulnerableLine: 16, // Line where the SQL query is constructed
                difficulty: "medium"
            }
        ];

        // Function to save all puzzles
        const savePuzzles = async () => {
            for (const puzzleData of puzzles) {
                const newPuzzle = new Puzzle({
                    _id: uuidv4(), // Generates a unique UUID
                    code: puzzleData.code,
                    language: puzzleData.language,
                    vulnerableLine: puzzleData.vulnerableLine,
                    difficulty: puzzleData.difficulty
                });

                try {
                    const savedPuzzle = await newPuzzle.save();
                    console.log('Puzzle saved successfully:');
                    console.log(savedPuzzle);
                } catch (err) {
                    console.error('Error saving puzzle:', err);
                }
            }
        };

        // Save all puzzles
        return savePuzzles();
    })
    .then(() => {
        // Close the MongoDB connection after all puzzles are saved
        return mongoose.connection.close();
    })
    .then(() => {
        console.log('Disconnected from MongoDB');
    })
    .catch((err) => {
        console.error('Error:', err);
        // Ensure the MongoDB connection is closed in case of error
        mongoose.connection.close();
    });
