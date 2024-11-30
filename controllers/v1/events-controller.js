import { Event } from "../../models/events-model.js";
import { isValidObjectId } from "mongoose";
import 'dotenv/config';
import { EventRegister } from "../../models/eventRegister.js";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, Bucket } from "../../middlewares/multerToS3.js";

const eventsController = {};

// * Function to create an event
eventsController.createEvent = async (req, res) => {
    try {
        const { title, date, description, location, maplink, speakerName, thumbnail } = req.body;

        if (!title?.trim()) {
            return res.status(400).json({ message: 'Invalid data' })
        }

        const event = await Event.create({ title, date, description, location, maplink, speakerName, thumbnail });

        if (!event) {
            return res.status(500).json({ message: 'Attempt failed' })
        }

        return res.status(201).json({ message: 'Event created successfully', result: event });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to get all events
eventsController.getAllEvents = async (req, res) => {
    try {
        const { date } = req.query;

        const filter = {}

        if (date) {
            filter.date = date
        }

        const events = await Event.find(filter).sort({ createdAt: -1 })

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

        if (!isValidObjectId(eventId)) {
            return res.status(400).json({ message: 'Invalid event ID format' });
        }

        const event = await Event.findById(eventId)

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

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

        if (!isValidObjectId(eventId)) {
            return res.status(400).json({ message: 'Invalid event ID format' });
        }

        const event = await Event.findByIdAndDelete(eventId)

        if (!event) {
            return res.status(404).json({ message: 'failed' });
        }

        if (event?.thumbnail?.key) {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: Bucket,
                Key: event?.thumbnail?.key
            })

            const response = await s3Client.send(deleteCommand)
            console.log("File deleted Successfully", response)
        }

        return res.status(200).json({ message: 'Event deleted successfully' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// * Function to update an event by ID
eventsController.updateEventById = async (req, res) => {
    try {
        const id = req.params.eventId;

        const { title, date, description, location, maplink, speakerName, thumbnail } = req.body;

        if (!isValidObjectId(id)) return res.status(409).json({ msg: "Invalid gallery id" })

        const event = await Event.findById(id);

        if (thumbnail) {
            if (event?.thumbnail?.key && thumbnail?.key !== event.thumbnail.key) {
                try {
                    const deleteCommand = new DeleteObjectCommand({
                        Bucket: Bucket,
                        Key: event?.thumbnail?.key
                    })
                    const response = await s3Client.send(deleteCommand)
                    console.log("File deleted Successfully", response)
                }
                catch (error) {
                    console.log(error)
                }
            }
        }

        const updatedevent = await Event.findByIdAndUpdate(id,
            { $set: { title, date, description, location, maplink, speakerName, thumbnail } },
            { new: true })

        if (!updatedevent) {
            return res.status(500).json({ msg: 'failed' })
        }

        res.status(200).json({ result: updatedevent, msg: "success" })

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

eventsController.postEventRegistration = async (req, res) => {
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

        res.status(200).json({ registrations: result })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


eventsController.updateEventRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) { return res.status(400).json({ msg: "Invalid Id" }) }
        const { event, name, phone, email, organization } = req.body;

        if (!(phone || email)) {
            return res.status(400).json({ msg: "Insufficient Data" })
        }

        const updateObj = {};
        for (const key of Object.keys(req.body)) {
            if (req.body[key]) {
                updateObj[key] = req.body[key]
            }
        }

        const updation = await EventRegister.findByIdAndUpdate(id, {
            $set: updateObj
        }, { new: true })

        if (!updation) {
            return res.status(500).json({ msg: 'failed' })
        }

        res.status(200).json({ msg: "success", updation })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

eventsController.deleteEventRegistration = async (req, res) => {
    try {
        const Id = req.params.id;
        if (!isValidObjectId(Id)) {
            return res.status(400).json({ msg: "Invalid Id" })
        }

        const registration = await EventRegister.findByIdAndDelete(Id)
        if (!registration) {
            return res.status(500).json({ msg: 'failed' })
        }

        res.status(200).json({ msg: 'success' })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}



// ? Export the eventsController
export { eventsController };