const express = require('express')
const { v4: uuid } = require('uuid')
const logger = require('../logger')
const { isWebUri } = require('valid-url')
const { bookmarks } = require('../store')
// const store = require('../store')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

bookmarksRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.json(bookmarks);
    })
    .post(bodyParser, (req, res) => {
        const { title, url, description = '', rating } = req.body;

        if (!title) {
            logger.error('title is required');
            return res
                .status(400)
                .send('title is required');
        }
        if (!url) {
            logger.error('url is required');
            return res
                .status(400)
                .send('url is required');
        }
        if (!rating) {
            logger.error('rating is required');
            return res
                .status(400)
                .send('rating is required');
        }

        if (!Number.isInteger(Number(rating)) || Number(rating) < 0 || Number(rating) > 5) {
            logger.error(`Invalid rating '${rating}' supplied`)
            return res.status(400).send(`'rating' must be a number between 0 and 5`)
        }

        if (!isWebUri(url)) {
            logger.error(`Invalid url '${url}' supplied`)
            return res.status(400).send(`'url' must be a valid URL`)
        }

        const id = uuid();
        const bookmark = {
            id,
            title,
            url,
            description,
            rating
        };

        // store.bookmarks.push(bookmark);
        bookmarks.push(bookmark);

        logger.info(`bookmark with id ${id} created`);

        res
            .status(201)
            .location(`http://localhost:8000/bookmarks/${id}`)
            .json(bookmark)
    })

bookmarksRouter
    .route('/bookmarks/:bookmark_id')
    .get((req, res) => {
        const { bookmark_id } = req.params
        const bookmark = bookmarks.find(b => b.id == bookmark_id)

        if (!bookmark) {
            logger.error(`Bookmark with id '${bookmark_id}' not found.`)
            return res
                .status(404)
                .send('Bookmark Not Found')
        }

        res.json(bookmark)
    })
    .delete((req, res) => {
        const { bookmark_id } = req.params
        const bookmarkIndex = bookmarks.findIndex(b => b.id === bookmark_id)

        if (bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${bookmark_id} not found.`)
            return res
                .status(404)
                .send('Bookmark Not Found')
        }

        bookmarks.splice(bookmarkIndex, 1)
        logger.info(`Bookmark with id ${bookmark_id} deleted.`)
        res
            .status(204)
            .end()
    })

module.exports = bookmarksRouter;