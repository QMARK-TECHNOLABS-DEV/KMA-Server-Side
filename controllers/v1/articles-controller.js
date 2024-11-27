import { isValidObjectId } from "mongoose";
import 'dotenv/config';
import { Articles } from "../../models/articles-model.js";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, Bucket } from "../../middlewares/multerToS3.js";

const articlesController = {};

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone to IST
dayjs.tz.setDefault('Asia/Kolkata');


// * Function to create an article
articlesController.createArticle = async (req, res) => {
    try {
        const { title, content, thumbnail } = req.body;

        if (!(title.trim() && content?.trim())) {
            return res.status(400).json({ message: 'Invalid data' })
        }

        const article = await Articles.create({ title, content, thumbnail })

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        return res.status(201).json({ message: 'success', result: article });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get all articles
articlesController.getAllArticles = async (req, res) => {
    try {
        const filters = {}

        const { date } = req.query

        if (date) {
            const parsedDate = dayjs(date, 'DD-MM-YYYY');

            const startOfDay = parsedDate.startOf('day').toISOString();
            const endOfDay = parsedDate.endOf('day').toISOString();

            filters.createdAt = {
                $gte: startOfDay,
                $lt: endOfDay
            }

        }

        const articles = await Articles.find(filters).sort({ createdAt: -1 });

        return res.status(200).json({ articles: articles });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get article by id
articlesController.getArticleById = async (req, res) => {
    try {
        const id = req.params.articleId;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid article id' });
        }

        const article = await Articles.findById(id);

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        return res.status(200).json(article);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to delete article by id
articlesController.deleteArticleById = async (req, res) => {
    try {
        const id = req.params.articleId;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid article id' });
        }

        const article = await Articles.findByIdAndDelete(id)

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        if (article?.thumbnail?.key) {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: Bucket,
                Key: article?.thumbnail?.key
            })

            const response = await s3Client.send(deleteCommand)
            console.log("File deleted Successfully", response)
        }

        res.status(200).json({ message: 'Article deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to update article by id
articlesController.updateArticleById = async (req, res) => {
    try {
        const id = req.params.articleId;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid article id' });
        }

        const article = await Articles.findByIdAndDelete(id)

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        const { title, content, thumbnail } = req.body;

        if (!(title.trim() && content?.trim())) {
            return res.status(400).json({ message: 'Invalid data' })
        }

        if (thumbnail) {
            if (article?.thumbnail?.key && thumbnail?.key !== article.thumbnail.key) {
                try {
                    const deleteCommand = new DeleteObjectCommand({
                        Bucket: Bucket,
                        Key: article?.thumbnail?.key
                    })

                    const response = await s3Client.send(deleteCommand)
                    console.log("File deleted Successfully", response)

                }
                catch (error) {
                    console.log(error)
                }
            }
        }

        const updated = await Articles.findByIdAndUpdate(id, { $set: req.body }, { new: true })

        if(!updated){
            return res.status(500).json({message: 'Attempt Failed'})
        }

        return res.status(200).json({ message: 'Article updated successfully', result: updated });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ? Export the articlesController
export { articlesController };