import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class User {

    _id?: string; //el id se crea solo
    
    @Prop({ unique: true, required: true })
    email: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, minlength: 6 })
    password?: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({type: [String], default: ['user']}) // [ 'user', 'admin' ]
    roles: string[];

}

export const UserSchema = SchemaFactory.createForClass(User);