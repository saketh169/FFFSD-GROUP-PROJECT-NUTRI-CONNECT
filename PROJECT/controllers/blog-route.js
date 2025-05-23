const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const router = express.Router();
const sanitizeHtml = require('sanitize-html');
const Blog = require('../models/blogModel');
const mongoose = require('mongoose');

// Define the path to the public folder
const publicPath = path.join(__dirname, '..', 'public');

// Create the uploads directory inside the public folder if it doesn't exist
const uploadDir = path.join(publicPath, 'blog-images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const blogImagesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadBlogImages = multer({
  storage: blogImagesStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).array('images', 5);

// ================= MIDDLEWARE =================

function blogAuthenticated(req, res, next) {
  if (req.session.user || req.session.dietitian || req.session.admin || req.session.organization) {
    next();
  } else {
    // Determine the message based on the requested path
    const isBlogView = req.path.startsWith('/blog/') && req.path !== '/blog';
    const message = isBlogView 
      ? 'You need to login to view the blog'
      : 'You need to login to post the blog';

    // Render a custom alert page
    res.status(401).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Authentication Required</title>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f0f2f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            overflow: hidden;
          }
          .alert-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease-out;
          }
          .alert-content {
            background-color: #fff;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            text-align: center;
            max-width: 400px;
            width: 90%;
            transform: translateY(-20px);
            animation: slideIn 0.3s ease-out forwards;
          }
          h1 {
            color: #e53e3e;
            font-size: 1.8rem;
            margin-bottom: 1rem;
            font-weight: 600;
          }
          p {
            color: #4a5568;
            font-size: 1.1rem;
            margin-bottom: 2rem;
            line-height: 1.5;
          }
          .btn {
            display: inline-block;
            text-decoration: none;
            color: #fff;
            background-color: #3182ce;
            padding: 0.8rem 1.6rem;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 500;
            transition: background-color 0.2s ease, transform 0.2s ease;
          }
          .btn:hover {
            background-color: #2b6cb0;
            transform: translateY(-2px);
          }
          .btn:active {
            transform: translateY(0);
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @media (max-width: 480px) {
            .alert-content {
              padding: 1.5rem;
              max-width: 300px;
            }
            h1 {
              font-size: 1.5rem;
            }
            p {
              font-size: 1rem;
            }
            .btn {
              padding: 0.7rem 1.4rem;
              font-size: 0.9rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="alert-modal">
          <div class="alert-content">
            <h1>🔒 Authentication Required</h1>
            <p>${message}</p>
            <a href="/roles_signin" class="btn">Sign In</a>
          </div>
        </div>
      </body>
      </html>
    `);
  }
}


// List of public routes
const publicRoutes = [
  "/", 
  "/blog", 
  "/contact", 
  "/roles_signin", 
  "/roles_signup", 
  "/submit", 
  "/Sign_in", 
  "/Sign_up", 
  "/chatbot", 
  "/privacy-policy", 
  "/terms_conditions"
];

// Middleware to check if the route is public or protected
router.use((req, res, next) => {
  const isPublicRoute = publicRoutes.some(route => {
    if (route.includes(":id")) {
      return req.path.startsWith(route.split(":id")[0]);
    }
    return req.path === route;
  });

  if (isPublicRoute) {
    next();
  } else {
    blogAuthenticated(req, res, next);
  }
});

router.get("/blog", async (req, res) => {
  try {
    const filter = req.query.filter || 'all';
    const page = parseInt(req.query.page) || 1;
    const perPage = 6;
    
    let query = {};
    if (filter !== 'all') {
      query.theme = { $regex: new RegExp(`^${filter}$`, 'i') };
    }

    const totalBlogs = await Blog.countDocuments(query);
    const totalPages = Math.ceil(totalBlogs / perPage);
    
    const blogs = await Blog.find(query)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    res.render("blog", { 
      blogs,
      currentFilter: filter,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Protected routes (require authentication)
router.get("/post", blogAuthenticated, (req, res) => {
  res.render("post");
});

router.post("/blog-submit", blogAuthenticated, uploadBlogImages, async (req, res) => {
  try {
    const { title, content, imageUrls, theme } = req.body;

    if (!title || !content || !theme) {
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          fs.unlink(file.path, (err) => {
            if (err) console.error(`Failed to delete file ${file.path}:`, err);
          });
        });
      }
      return res.status(400).redirect("/post?error=Missing+required+fields");
    }

    let authorType, authorId, authorName, authorEmail;
    if (req.session.user) {
      authorType = 'user';
      authorId = req.session.user.id;
      authorName = req.session.user.name;
      authorEmail = req.session.user.email;
    } else if (req.session.dietitian) {
      authorType = 'dietitian';
      authorId = req.session.dietitian.id;
      authorName = req.session.dietitian.name;
      authorEmail = req.session.dietitian.email;
    } else if (req.session.admin) {
      authorType = 'admin';
      authorId = req.session.admin.id;
      authorName = req.session.admin.name;
      authorEmail = req.session.admin.email;
    } else if (req.session.organization) {
      authorType = 'organization';
      authorId = req.session.organization.id;
      authorName = req.session.organization.name;
      authorEmail = req.session.organization.email;
    } else {
      return res.status(403).redirect("/role_signin");
    }

    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => `/blog-images/${file.filename}`);
    }

    if (imageUrls) {
      const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
      for (const url of urls) {
        try {
          new URL(url);
          imagePaths.push(url);
        } catch (err) {
          console.warn(`Invalid image URL skipped: ${url}`);
        }
      }
    }

    const newBlog = new Blog({
      title: sanitizeHtml(title),
      content: sanitizeHtml(content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt', 'width', 'height', 'style']
        }
      }),
      images: imagePaths,
      theme,
      authorId,
      authorType,
      authorName,
      authorEmail
    });

    await newBlog.save();
    res.redirect(`/blog/${newBlog._id}`);
  } catch (error) {
    console.error("Error submitting blog:", error);
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error(`Failed to delete file ${file.path}:`, err);
        });
      });
    }
    res.status(500).redirect("/post?error=Server+error");
  }
});

router.use("/blog-images", express.static(uploadDir));

router.get("/blog/:id", blogAuthenticated, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).render('400', { 
        message: 'Invalid blog ID format'
      });
    }

    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).render('404', { 
        message: 'Blog not found'
      });
    }

    res.render("single-blog", { 
      blog
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;