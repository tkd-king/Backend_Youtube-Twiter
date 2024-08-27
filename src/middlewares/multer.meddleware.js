import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");// yaha pr ek mistake h mn nay / say pehlay . nahe lagaya tha jis ky waja say mujhay pory series shoro say dekhni pary [({ proofed })]
  },
  
  filename: function (req, file, cb) {
    console.log(file.originalname);
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

export default upload;
