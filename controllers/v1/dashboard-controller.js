import mongoose from 'mongoose'
import { Member } from '../../models/MemberModel.js'

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { Application } from '../../models/ApplicationModel.js';
import { HallEnquiry } from '../../models/hall-enquiries-model.js';

dayjs.extend(utc);
dayjs.extend(timezone);

// Set the default timezone to IST
dayjs.tz.setDefault('Asia/Kolkata');

const dashCtrl = {}

dashCtrl.memberChart = async (req, res) => {
    try {
        let labels = [];
        let data = [];

        const currentYear = dayjs().year()
        const currentMonth = dayjs().month();

        console.log("currentYear", currentYear)
        console.log("currentMonth", currentMonth)

        const monthsArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for (let i = 0; i <= currentMonth; i++) {
            labels.push(monthsArray[i]);
            data.push(0);
        }

        const startDate = dayjs.utc().startOf('year').toDate();
        const endDate = dayjs.utc().endOf('year').toDate();

        const filter = { createdAt: { $gte: startDate, $lte: endDate } }

        const members = await Member.find(filter)

        members.forEach(member => {
            const month = member?.createdAt?.toDateString().split(' ')[1];
            const dateToCheck = dayjs.utc(member?.createdAt);
            const currentYear = dayjs().year();

            if (dateToCheck.year() === currentYear) {
                for (let i = 0; i < labels.length; i++) {
                    if (month === labels[i]) {
                        data[i] += 1;
                    }
                }
            }

        })

        const totalMembers = await Member.countDocuments()
        const memberCountCurrentMonth = data[data?.length - 1];
        console.log(data[data?.length - 1])

        const increment = memberCountCurrentMonth / totalMembers * 100;

        const result = {
            labels, data, total: totalMembers, increment
        }
        console.log(result)

        res.status(200).json({ result })


    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Internal server error' })
    }
}

dashCtrl.analytics = async (req, res) => {
    try {


    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Internal server error' })
    }
}

dashCtrl.recentUpdates = async (req, res) => {
    try {
        const startOfDay = dayjs().startOf('day').toISOString();
        const endOfDay = dayjs().endOf('day').toISOString();

        const applicationCount = await Application.countDocuments({
            status:'pending',
            createdAt: {
                $gte: startOfDay, 
                $lt: endOfDay    
            }
        })

        const enquiryCount = await HallEnquiry.countDocuments({
            createdAt: {
                $gte: startOfDay, 
                $lt: endOfDay    
            }
        })

        const result = {
            applicationCount, enquiryCount
        }

        res.status(200).json({result})

    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Internal server error' })
    }
}

export { dashCtrl }