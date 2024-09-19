import mongoose from "mongoose";
import { Event } from "../../models/events-model.js";
import { commonController } from "./common-controller.js";
import { isValidObjectId } from "mongoose";
import 'dotenv/config';
import { EventRegister } from "../../models/eventRegister.js";

const { ObjectId } = mongoose.Types;

const eventsController = {};

// * Function to save events to MongoDB
eventsController.saveEventToDB = async (title, date, description, location, speakerName, speakerCoverUrl, speakerCoverFileName) => {
    const collection = mongoose.connection.collection(process.env.EVENTS_COLLECTION_NAME);

    const metadata = new Event({
        title: title,
        date: date,
        description: description,
        location: location,
        speakerName: speakerName,
        speakerCoverUrl: speakerCoverUrl,
        speakerCoverFileName: speakerCoverFileName
    });

    await collection.insertOne(metadata);
}

// * Function to create an event
eventsController.createEvent = async (req, res) => {
    try {
        const title = req.body.title;
        const date = req.body.date;
        const description = req.body.description;
        const location = req.body.location;
        const speakerName = req.body.speakerName;
        const speakerCover = req.file;

        const { publicUrl: speakerCoverUrl, fileName: speakerCoverName } = await commonController.uploadFileToFirebase(speakerCover, process.env.EVENTS_SPEAKER_COVER_FOLDER_PATH);

        console.log(speakerCoverUrl, speakerCoverName);
        await eventsController.saveEventToDB(title, date, description, location, speakerName, speakerCoverUrl, speakerCoverName);

        return res.status(201).json({ message: 'Event created successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get all events
eventsController.getAllEvents = async (req, res) => {
    try {
        const { date } = req.query;
        console.log(date)

        const filter = {}

        if (date) {
            filter.date = date
        }

        const collection = mongoose.connection.collection(process.env.EVENTS_COLLECTION_NAME);

        const events = await collection.find(filter).sort({ createdAt: -1 }).toArray();

        return res.status(200).json({ events: events });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get an event by ID
eventsController.getEventById = async (req, res) => {
    try {
        const eventId = req.params.eventId;

        if (!isValidObjectId(eventId))
            return res.status(400).json({ message: 'Invalid event ID format' });

        const collection = mongoose.connection.collection(process.env.EVENTS_COLLECTION_NAME);

        const event = await collection.findOne({ _id: new ObjectId(eventId) });

        if (!event)
            return res.status(404).json({ message: 'Event not found' });

        return res.status(200).json(event);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to delete an event by ID
eventsController.deleteEventById = async (req, res) => {
    try {
        const eventId = req.params.eventId;

        if (!isValidObjectId(eventId))
            return res.status(400).json({ message: 'Invalid event ID format' });

        const collection = mongoose.connection.collection(process.env.EVENTS_COLLECTION_NAME);

        const event = await collection.findOne({ _id: new ObjectId(eventId) });

        if (!event)
            return res.status(404).json({ message: 'Event not found' });

        await commonController.deleteFileFromFirebase(`${event.speakerCoverFileName}`);

        await collection.deleteOne({ _id: new ObjectId(eventId) });

        return res.status(200).json({ message: 'Event deleted successfully' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to update an event by ID
eventsController.updateEventById = async (req, res) => {
    try {
        const eventId = req.params.eventId;

        if (!isValidObjectId(eventId))
            return res.status(400).json({ message: 'Invalid event ID format' });

        const collection = mongoose.connection.collection(process.env.EVENTS_COLLECTION_NAME);

        const event = await collection.findOne({ _id: new ObjectId(eventId) });

        if (!event)
            return res.status(404).json({ message: 'Event not found' });

        const title = req.body.title;
        const date = req.body.date;
        const description = req.body.description;
        const location = req.body.location;
        const speakerName = req.body.speakerName;
        const speakerCover = req.file;

        let speakerCoverUrl = event.speakerCoverUrl;
        let speakerCoverName = event.speakerCoverFileName;

        if (speakerCover) {
            await commonController.deleteFileFromFirebase(`${event.speakerCoverFileName}`);
            const { publicUrl, fileName } = await commonController.uploadFileToFirebase(speakerCover, process.env.EVENTS_SPEAKER_COVER_FOLDER_PATH);
            speakerCoverUrl = publicUrl;
            speakerCoverName = fileName;
        }

        await collection.updateOne({ _id: new ObjectId(eventId) }, { $set: { title: title, date: date, description: description, location: location, speakerName: speakerName, speakerCoverUrl: speakerCoverUrl, speakerCoverFileName: speakerCoverName } });

        return res.status(200).json({ message: 'Event updated successfully' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


eventsController.archiveMultiple = async (req, res) => {
    try {
        const { archiveList } = req.body;

        if (archiveList?.some(item => !isValidObjectId(item))) { return res.status(400).json({ message: 'Invalid id' }) }

        const response = await Event.updateMany({ _id: { $in: archiveList } }, { $set: { isArchived: true } })

        console.log({ response })

        res.status(200).json({ message: 'Events archived' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


eventsController.deleteMultiple = async (req, res) => {
    try {
        const { deleteList } = req.body;

        if (deleteList?.some(item => !isValidObjectId(item))) { return res.status(400).json({ message: 'Invalid id' }) }

        const response = await Event.deleteMany({ _id: { $in: deleteList } })

        console.log({ response })

        res.status(200).json({ message: 'Events archived' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

eventsController.registerEvent = async (req, res) => {
    try {
        const { event, name, phone, email, organization } = req.body;
        if (!isValidObjectId(event)) { return res.status(400).json({ msg: "Invalid Id" }) }

        const haveEvent = await Event.findById(event)
        if (!haveEvent) { return res.status(400).json({ msg: "Event not found" }) }

        if (!(phone || email)) {
            return res.status(400).json({ msg: "Insufficient Data" })
        }

        const registration = await EventRegister.create({ event, name, phone, email, organization })

        res.status(200).json({ msg: "Event Registered", registration })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

eventsController.getAnEventRegistration = async (req, res) => {
    try {
        const Id = req.params.id;
        if (!isValidObjectId(Id)) {
            return res.status(400).json({ msg: "Invalid Id" })
        }

        const registration = await EventRegister.findById(Id)
            .populate('event', '_id title date')

        res.status(200).json({ registration })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

eventsController.getManyEventRegistrations = async (req, res) => {
    try {
        const filters = {}

        const { date } = req.query
        const searchQuery = req.query.search;
        if (searchQuery) { filters.name = { $regex: new RegExp(searchQuery, "i") } }

        if (date) {
            const parsedDate = dayjs(date, 'DD-MM-YYYY');

            const startOfDay = parsedDate.startOf('day').toISOString();
            const endOfDay = parsedDate.endOf('day').toISOString();

            filters.createdAt = {
                $gte: startOfDay,
                $lt: endOfDay
            }

        }

        // Paginators
        const page = req.query.page;
        const entries = req.query.entries;

        const registrations = await EventRegister.find(filters)
            .populate('event', '_id title date')
            .sort({ createdAt: -1 })

        let result = registrations;

        if (page && entries) {
            result = result.slice(((page - 1) * entries), (page * entries))
        }

        res.status(200).json({ registrations : result })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ? Export the eventsController
export { eventsController };