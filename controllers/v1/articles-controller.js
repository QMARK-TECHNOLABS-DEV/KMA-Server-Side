import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";
import 'dotenv/config';
import { Articles } from "../../models/articles-model.js";
import { commonController } from "./common-controller.js";

const { ObjectId } = mongoose.Types;

const articlesController = {};

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone to IST
dayjs.tz.setDefault('Asia/Kolkata');

// * Function to save articles to MongoDB
articlesController.saveArticleToDB = async (title,coverImageUrl, coverImagefileName, content) => {
    const collection = mongoose.connection.collection(process.env.ARTICLES_COLLECTION_NAME);

    const metadata = new Articles({
        title: title,
        coverImageUrl: coverImageUrl,
        coverImageFileName: coverImagefileName,
        content: content
    });

    await collection.insertOne(metadata);
}

// * Function to create an article
articlesController.createArticle = async (req, res) => {
    try {
        const title = req.body.title;
        const content = req.body.content;
        const coverImage = req.file;

        const { publicUrl: coverImageUrl, fileName: coverImageName } = await commonController.uploadFileToFirebase(coverImage, process.env.ARTICLES_COVER_FOLDER_PATH);

        console.log(coverImageUrl, coverImageName);
        await articlesController.saveArticleToDB(title, coverImageUrl, coverImageName, content);

        return res.status(201).json({ message: 'Article created successfully' });
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
        // const collection = mongoose.connection.collection(process.env.ARTICLES_COLLECTION_NAME);

        const articles = await Articles.find(filters).sort({ createdAt: -1 });

        return res.status(200).json({ articles : articles });
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

        const collection = mongoose.connection.collection(process.env.ARTICLES_COLLECTION_NAME);

        const article = await collection.findOne({ _id: new ObjectId(id) });

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

        const collection = mongoose.connection.collection(process.env.ARTICLES_COLLECTION_NAME);

        const article = await collection.findOne({ _id: new ObjectId(id) });

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        await commonController.deleteFileFromFirebase(`${article.coverImageFileName}`);

        await collection.deleteOne({ _id: new ObjectId(id) });

        return res.status(200).json({ message: 'Article deleted successfully' });
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

        const collection = mongoose.connection.collection(process.env.ARTICLES_COLLECTION_NAME);

        const article = await collection.findOne({ _id: new ObjectId(id) });

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        const title = req.body.title;
        const content = req.body.content;
        const coverImage = req.file;

        if(coverImage) {
            await commonController.deleteFileFromFirebase(`${article.coverImageFileName}`);
            const { publicUrl: coverImageUrl, fileName: coverImageName } = await commonController.uploadFileToFirebase(coverImage, process.env.ARTICLES_COVER_FOLDER_PATH);
            await collection.updateOne({ _id: new ObjectId(id) }, { $set: { title: title, content: content, coverImageUrl: coverImageUrl, coverImageFileName: coverImageName } });
        }
        else {
            await collection.updateOne({ _id: new ObjectId(id) }, { $set: { title: title, content: content } });
        }

        return res.status(200).json({ message: 'Article updated successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ? Export the articlesController
export { articlesController };