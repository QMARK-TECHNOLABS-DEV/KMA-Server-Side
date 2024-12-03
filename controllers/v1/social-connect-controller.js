import { isValidObjectId} from "mongoose";
import 'dotenv/config';
import { SocialConnects } from "../../models/social-connect-model.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, Bucket } from "../../middlewares/multerToS3.js";

const socialConnectController = {};

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone to IST
dayjs.tz.setDefault('Asia/Kolkata');

// * Function to add a social connect link
socialConnectController.addSocialConnect = async (req, res) => {
    try {
        const { title, platform, thumbnail, link } = req.body;

        if(!(platform && link)){
            return res.status(400).json({message: 'Insufficient data'})
        }

        const newSocialConnect = await SocialConnects.create({ title, platform, thumbnail, link })

        if (!newSocialConnect) {
            return res.status(500).json({ msg: "failed" })
        }

        res.status(200).json({ result: newSocialConnect, msg: "success" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get all social connects
socialConnectController.getAllSocialConnects = async (req, res) => {
    try {
        const filters = {}

        const {month, year} = req.query;
        
        if (month && year) {
            filters.$expr = {
                $and: [
                    { $eq: [{ $month: "$createdAt" }, month] },
                    { $eq: [{ $year: "$createdAt" }, year] },
                ],
            }
        }

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
        const socialConnects = await SocialConnects.find(filters)
        .sort({ createdAt: -1 });

        return res.status(200).json({ socialConnects : socialConnects });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get social connect by id
socialConnectController.getSocialConnectById = async (req, res) => {
    try {
        const id = req.params.socialConnectId;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid id' });
        }

        const socialConnect = await SocialConnects.findById(id)

        if (!socialConnect) {
            return res.status(404).json({ message: 'Social connect not found' });
        }

        return res.status(200).json(socialConnect);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to update social connect by id
socialConnectController.updateSocialConnectById = async (req, res) => {
    try {
        const id = req.params.socialConnectId;
        const {title, platform, thumbnail, link }= req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid id' });
        }

        const updateObj = {};

        if (title?.trim()) {
            updateObj.title = title;
        }
        if (platform?.trim()) {
            updateObj.platform = platform;
        }
        if (link?.trim()) {
            updateObj.link = link;
        }

        const socialconnect = await SocialConnects.findById(id);

        if (thumbnail) {
            if (socialconnect?.thumbnail?.key && thumbnail?.key !== socialconnect.thumbnail.key) {
                try {
                    const deleteCommand = new DeleteObjectCommand({
                        Bucket: Bucket,
                        Key: socialconnect?.thumbnail?.key
                    })

                    const response = await s3Client.send(deleteCommand)
                    console.log("File deleted Successfully", response)

                }
                catch (error) {
                    console.log(error)
                }
            }

            updateObj.thumbnail = thumbnail
        }

        const updatedsocialconnect = await SocialConnects.findByIdAndUpdate(id, { $set: updateObj }, { new: true })

        if (!updatedsocialconnect) {
            return res.status(500).json({ msg: 'failed' })
        }

        res.status(200).json({ result: updatedsocialconnect, msg: "success" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to delete social connect by id
socialConnectController.deleteSocialConnectById = async (req, res) => {
    try {
        const id = req.params.socialConnectId;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: 'Invalid id' });
        }

        const socialConnect = await SocialConnects.findByIdAndDelete(id)

        if (!socialConnect) {
            return res.status(404).json({ message: 'Social connect not found' });
        }

        if (socialConnect?.thumbnail?.key) {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: Bucket,
                Key: socialConnect?.thumbnail?.key
            })

            const response = await s3Client.send(deleteCommand)
            console.log("File deleted Successfully", response)
        }

        return res.status(200).json({ message: 'success' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ? Export the socialConnectController
export { socialConnectController };
