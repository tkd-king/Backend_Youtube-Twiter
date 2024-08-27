import mongoose, { Schema } from "mongoose";
import mongooseAggregatePagination from "mongoose-aggregate-paginate-v2"; 





const videoSchema = new Schema(
    {
        videoFile:{
            type:String,//cloudenory url
            required:true
        },
        thumbnail:{
            type:String,
            required:true
        },
        owner:[ //yay owner nahe h 
            {
                type: Schema.Types.ObjectId,
                ref:"User"
            }
        ],
        title:{
            required:true,
            type:String,
        },
        description:{
            type: String,
            required:true,
        },
        duration:{
            type: Number,
            required: true
        },
        views:{
            type:Number,
            default:"0" //video mn yay 0 easay likha h 
        },
        isPublished:{
            type:Boolean,
            default:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }

    }
    ,{timestamps:true});



videoSchema.plugins(mongooseAggregatePagination)
export const Video = mongoose.model("Video",videoSchema) 