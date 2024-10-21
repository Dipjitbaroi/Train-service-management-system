import Train from "./models/trainModel.js";
import TrainSettings from "./models/trainSettingsModel.js";

export const autoGenerateSchedule = async () => {
  try {
    console.log("Running daily train generation task...");

    const trainSettingsList = await TrainSettings.find().populate(
      "stops.station"
    );

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    for (const trainSetting of trainSettingsList) {
      const [departureHours, departureMinutes] =
        trainSetting.departureTimeFromOrigin.split(":").map(Number);

      const journeyDate = new Date(tomorrow);
      journeyDate.setHours(departureHours);
      journeyDate.setMinutes(departureMinutes);
      journeyDate.setSeconds(0);
      journeyDate.setMilliseconds(0);

      console.log("Journey Date:", journeyDate);

      const trainStops = [];

      for (const stop of trainSetting.stops) {
        const arrivalTime = new Date(journeyDate);
        arrivalTime.setMinutes(arrivalTime.getMinutes() + stop.time);

        const departureTime = new Date(arrivalTime);
        departureTime.setMinutes(
          departureTime.getMinutes() + stop.standingTime
        );

        trainStops.push({
          station: stop.station,
          arrivalTime: arrivalTime,
          departureTime: departureTime,
        });
      }

      const trainName = `${trainSetting.name} Train`;

      const newTrain = new Train({
        name: trainName,
        journeyDate: journeyDate,
        trainSettings: trainSetting._id,
        stops: trainStops,
      });

      await newTrain.save();
    }

    console.log("Daily train generation task completed.");
  } catch (err) {
    console.error("Error during daily train generation:", err);
  }
};
