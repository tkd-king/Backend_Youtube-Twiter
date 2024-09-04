import mongoose,{Schema} from "mongoose";
import mongooseAggregatePagination from "mongoose-aggregate-paginate-v2"; 


const commentSchema = new Schema(
    {
        comment: {
            type: String,
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    }
    ,{ timestamps: true });

videoSchema.plugins(mongooseAggregatePagination)

export const Comment = mongoose.model('Comment', commentSchema)