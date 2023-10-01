const express = require('express');
const axios = require('axios');
const _ = require('lodash');
const ejs = require('ejs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Views'));

let blogData = [];

/* Memoization Method */
let cache = {
    blogStats: null,
    searchResults: new Map(),
};

// const fetchAndAnalyzeBlogData = async () => {
//     try {
//         // Fetch data from the third-party blog API
//         const response = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
//             headers: {
//                 'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
//             }
//         });

//         // Handle the response and extract data
//         blogData = response.data.blogs;

//         // Perform data analysis using Lodash
//         const totalBlogs = blogData.length;
//         const blogWithLongestTitle = _.maxBy(blogData, (blog) => blog.title.length);
//         const blogsWithPrivacyTitle = _.filter(blogData, (blog) =>
//             _.includes(_.toLower(blog.title), 'privacy')
//         );
//         const uniqueBlogTitles = _.uniqBy(blogData, 'title');

//         // Prepare the analytics results as an object
//         const analyticsResults = {
//             totalBlogs: totalBlogs,
//             longestTitle: blogWithLongestTitle,
//             privacyBlogs: blogsWithPrivacyTitle.length,
//             uniqueBlogTitles: uniqueBlogTitles,
//             blogData: blogData
//         };

//         // Cache the results
//         cache.blogStats = analyticsResults;

//         return analyticsResults;
//     } catch (error) {
//         console.error('Error fetching or analyzing blog data:', error);
//         throw error; // Re-throw the error to be handled in the route handler
//     }
// };

app.get('/', (req, res) => {
    res.render('Home')
})
// app.get('/api/blog-stats', async (req, res) => {
//     try {
//         if (cache.blogStats) {
//             // If the data is cached, use it
//             res.render('DataAnalysis', cache.blogStats);
//         } else {
//             // Otherwise, fetch and analyze the data
//             const analyticsResults = await fetchAndAnalyzeBlogData();
//             res.render('DataAnalysis', {
//                 totalBlogs: analyticsResults.totalBlogs,
//                 longestTitle: analyticsResults.longestTitle,
//                 privacyBlogs: analyticsResults.privacyBlogs,
//                 uniqueBlogTitles: analyticsResults.uniqueBlogTitles,
//                 blogData: blogData
//             });
//         }
//     } catch (error) {
//         console.error('Error fetching or analyzing blog data:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// app.get('/api/blog-search', (req, res) => {
//     try {
//         const query = req.query.query;

//         if (!query) {
//             return res.status(400).json({ error: 'Query parameter "query" is required.' });
//         }

//         // Check if the query result is cached
//         if (cache.searchResults.has(query)) {
//             res.render('Results', { results: cache.searchResults.get(query) });
//         } else {
//             // Implement the search functionality by filtering the blogs
//             const filteredBlogs = blogData.filter((blog) =>
//                 blog.title.toLowerCase().includes(query.toLowerCase())
//             );

//             // Cache the search results
//             cache.searchResults.set(query, filteredBlogs);

//             res.render('Results', { results: filteredBlogs });
//         }
//     } catch (error) {
//         console.error('Error searching for blogs:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });


/* Memoization Method implemented */


/* Normal method */
app.get('/api/blog-stats', async (req, res) => {
    try {
        // Make a cURL-like request to the third-party blog API
        const response = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
            headers: {
                'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
            }
        });

        // Handle the response and extract data
        blogData = response.data.blogs;

        console.log(response.data.blogs)
        console.log("Response Length -> ", blogData.length)
        // Perform data analysis using Lodash
        const blogDataSize = _.size(blogData);
        console.log(blogDataSize)
        // Find the blog with the longest title
        const blogWithLongestTitle = _.maxBy(blogData, (blog) => blog.title.length);

        // Determine the number of blogs with titles containing the word "privacy"
        const blogsWithPrivacyTitle = _.filter(blogData, (blog) =>
            _.includes(_.toLower(blog.title), 'privacy')
        );

        // Create an array of unique blog titles (no duplicates)
        const uniqueBlogTitles = _.uniqBy(blogData, 'title');

        // Prepare the analytics results as an object
        const analyticsResults = {
            totalBlogs: blogDataSize,
            blogWithLongestTitle: blogWithLongestTitle,
            numberOfBlogsWithPrivacyTitle: blogsWithPrivacyTitle.length,
            uniqueBlogTitles: uniqueBlogTitles,
        };

        console.log(analyticsResults)
        // Return the analytics results as JSON
        res.render('DataAnalysis', {
            totalBlogs: analyticsResults.totalBlogs,
            longestTitle: analyticsResults.blogWithLongestTitle,
            privacyBlogs: analyticsResults.numberOfBlogsWithPrivacyTitle,
            uniqueBlogTitles: analyticsResults.uniqueBlogTitles,
            blogData: blogData
        });
    } catch (error) {
        console.error('Error fetching or analyzing blog data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/blog-search', (req, res) => {
    try {
        // Get the query parameter 'query' from the request
        const query = req.query.query;

        if (!query) {
            return res.status(400).json({ error: 'Query parameter "query" is required.' });
        }

        // Implement the search functionality by filtering the blogs
        const filteredBlogs = blogData.filter((blog) =>
            blog.title.toLowerCase().includes(query.toLowerCase())
        );

        // Respond with the filtered blogs
        console.log(filteredBlogs)
        res.render('Results', { results: filteredBlogs });

    } catch (error) {
        console.error('Error searching for blogs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/* Normal method */


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
