import {ParseLatLong} from "./misc";
import moment from "moment";

export const updatePictures = async ({currentLocation, item, currentUser, isWaterMark, name, id, originWidth, originHeight}) => {

    let mediaType = item.mime.split('/')[0];

    let tp_image = {
      uri: item.path,
      latitude: 0,
      longitude: 0,
      timestamp: new Date().getTime(),
      date: new Date(),
      comment: "",
      isVisible: false,
      isWaterMark,
      watermarked: false,
      prompt_id: id || "",
      isRejected: false,
      mediaType: mediaType,
      mimeType: item.mime,
      isPlay: false,
      tag: name || "",
      waterMarked: false,
      originWidth,
      originHeight
    };

  try {

    if (item.exif && item.exif.GPSLongitude != null && item.exif.GPSLatitude != null) {
      tp_image.latitude = ParseLatLong(item.exif.GPSLatitude, item.exif.GPSLatitudeRef);
      tp_image.longitude = ParseLatLong(item.exif.GPSLongitude, item.exif.GPSLongitudeRef);
    } else {
      try {
        tp_image.latitude = currentLocation.lat.toString();
        tp_image.longitude = currentLocation.lng.toString();
      } catch (e) {
      }
    }

    if (item.exif && item.exif.DateTime != null) {
      tp_image.date = moment(item.exif.DateTime, "YYYY-MM-DD HH:mm:ss").format("MM/DD/YYYY hh:mm:ss A");
      tp_image.timestamp = moment(item.exif.DateTime, "YYYY-MM-DD HH:mm:ss").format('X');
    }

    return tp_image;
  } catch (e) {
    console.log('image watermark error', e);
    return tp_image;
  }


};


