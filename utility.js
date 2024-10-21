import {
  convertMinutesToTime,
  convertTimeToMinutes,
} from "./controllers/trainController.js";
import Train from "./models/trainModel.js";
import TrainSettings from "./models/trainSettingsModel.js";

// export const autoGenerateSchedule = async () => {
//   try {
//     console.log("Running daily train generation task...");

//     // Fetch all train settings
//     const trainSettingsList = await TrainSettings.find().populate(
//       "stops.station"
//     ); // Populate station for accurate data

//     // For each train setting, create a new train for the next day's journey
//     const tomorrow = new Date();
//     tomorrow.setDate(tomorrow.getDate() + 1); // Set the date to tomorrow

//     // Loop through each train setting to create a train
//     for (const trainSetting of trainSettingsList) {
//       // Get the departure time of the train from the origin station (in HH:mm format)
//       const originDepartureTime = new Date(
//         tomorrow.getFullYear(),
//         tomorrow.getMonth(),
//         tomorrow.getDate(),
//         trainSetting.departureTimeFromOrigin.getHours(),
//         trainSetting.departureTimeFromOrigin.getMinutes()
//       );

//       // Initialize the current time as the departure time from the origin
//       let currentTime = originDepartureTime;

//       // Calculate arrival and departure times for each stop
//       const stops = trainSetting.stops.map((stop, index) => {
//         // Arrival time: current time + travel time (time to the stop from previous stop)
//         const arrivalTime = addMinutesToDate(currentTime, stop.time);

//         // Update current time for departure (arrival time + standing time)
//         const departureTime = addMinutesToDate(arrivalTime, stop.standingTime);

//         // Update current time for the next iteration (this stop's departure time)
//         currentTime = departureTime;

//         return {
//           station: stop.station,
//           arrivalTime,
//           departureTime,
//         };
//       });

//       // Create a train instance using the train settings
//       const newTrain = new Train({
//         name: `${trainSetting.trainType} Train`,
//         journeyDate: tomorrow, // Set journeyDate to tomorrow
//         trainSettings: trainSetting._id,
//         stops: stops, // Use the calculated stops with accurate arrival/departure times
//       });

//       // Save the new train to the database
//       await newTrain.save();
//     }

//     console.log("Daily train generation task completed.");
//   } catch (err) {
//     console.error("Error during daily train generation:", err);
//   }
// };

// export const autoGenerateSchedule = async () => {
//   try {
//     console.log("Running daily train generation task...");

//     // Fetch all train settings
//     const trainSettingsList = await TrainSettings.find().populate(
//       "stops.station"
//     ); // Populate station for accurate data

//     // For each train setting, create a new train for the next day's journey
//     const tomorrow = new Date();
//     tomorrow.setDate(tomorrow.getDate() + 1); // Set the date to tomorrow

//     // Loop through each train setting to create a train
//     for (const trainSetting of trainSettingsList) {
//       // Get the departure time from origin as "HH:mm" and convert to minutes
//       const departureTimeInMinutes = convertTimeToMinutes(
//         trainSetting.departureTimeFromOrigin
//       );

//       // Initialize current time in minutes (start with departure time from the origin)
//       let currentTimeInMinutes = departureTimeInMinutes;

//       // Calculate stops' arrival and departure times
//       const trainStops = trainSetting.stops.map((stop, index) => {
//         // Arrival time in minutes = current time + travel time to this stop
//         const arrivalTimeInMinutes = currentTimeInMinutes + stop.time;

//         // Departure time in minutes = arrival time + standing time
//         const departureTimeInMinutes = arrivalTimeInMinutes + stop.standingTime;

//         // Update current time for the next iteration
//         currentTimeInMinutes = departureTimeInMinutes;

//         return {
//           station: stop.station,
//           arrivalTime: convertMinutesToTime(arrivalTimeInMinutes, tomorrow),
//           departureTime: convertMinutesToTime(departureTimeInMinutes, tomorrow),
//         };
//       });

//       // Create the new train object
//       const newTrain = new Train({
//         name: `${trainSetting.name} Train`,
//         journeyDate: tomorrow, // Set journeyDate to tomorrow
//         trainSettings: trainSetting._id,
//         stops: trainStops, // Use the calculated stops with accurate times
//       });

//       // Save the new train to the database
//       await newTrain.save();
//     }

//     console.log("Daily train generation task completed.");
//   } catch (err) {
//     console.error("Error during daily train generation:", err);
//   }
// };

export const autoGenerateSchedule = async () => {
  try {
    console.log("Running daily train generation task...");

    // Fetch all train settings
    const trainSettingsList = await TrainSettings.find().populate(
      "stops.station"
    ); // Populate station for accurate data

    // For each train setting, create a new train for the next day's journey
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // Set the date to tomorrow

    // Loop through each train setting to create a train
    for (const trainSetting of trainSettingsList) {
      // Get the departure time from origin as "HH:mm"
      const [departureHours, departureMinutes] =
        trainSetting.departureTimeFromOrigin.split(":").map(Number);

      // Set the journeyDate by combining tomorrow's date with the departure time
      const journeyDate = new Date(tomorrow);
      journeyDate.setHours(departureHours); // Set hours from trainSettings.departureTimeFromOrigin
      journeyDate.setMinutes(departureMinutes); // Set minutes from trainSettings.departureTimeFromOrigin
      journeyDate.setSeconds(0); // Reset seconds to 0
      journeyDate.setMilliseconds(0); // Reset milliseconds to 0

      console.log("Journey Date:", journeyDate);

      // Initialize the train stops array
      const trainStops = [];

      // Calculate stops' arrival and departure times
      for (const stop of trainSetting.stops) {
        // Calculate arrivalTime based on journeyDate + stop.time (time is assumed to be in minutes)
        const arrivalTime = new Date(journeyDate);
        arrivalTime.setMinutes(arrivalTime.getMinutes() + stop.time); // Add stop.time (minutes) to journeyDate

        // Calculate departureTime based on arrivalTime + stop.standingTime
        const departureTime = new Date(arrivalTime);
        departureTime.setMinutes(
          departureTime.getMinutes() + stop.standingTime
        ); // Add standingTime to arrivalTime

        // Push the calculated stop data to trainStops
        trainStops.push({
          station: stop.station,
          arrivalTime: arrivalTime, // Set the calculated arrival time
          departureTime: departureTime, // Set the calculated departure time
        });
      }

      // Name of the train: combining the train setting name and adding "Train"
      const trainName = `${trainSetting.name} Train`;

      // Create the new train object
      const newTrain = new Train({
        name: trainName, // Dynamic name calculation
        journeyDate: journeyDate, // Set journeyDate to the specified journey date
        trainSettings: trainSetting._id, // Reference to train settings
        stops: trainStops, // Use the calculated stops with accurate times
      });

      // Save the new train to the database
      await newTrain.save();
    }

    console.log("Daily train generation task completed.");
  } catch (err) {
    console.error("Error during daily train generation:", err);
  }
};
