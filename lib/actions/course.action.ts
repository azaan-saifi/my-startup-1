"use server";

import Course from "@/lib/database/models/courses.model";

import { connectToDatabase } from "../database/mongoose";

export async function getAllCourses() {
  try {
    await connectToDatabase();
    const courses = await Course.find({});
    return JSON.stringify(courses);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function updateEnrolledStatus(_id: string) {
  try {
    await connectToDatabase();
    await Course.updateOne({ _id }, { enrolled: true });
    return { message: "Course enrollment was successfull!" };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getCourseById(_id: string) {
  try {
    await connectToDatabase();
    const course = await Course.findById(_id);
    return JSON.stringify(course);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getTopThreeCourses() {
  try {
    await connectToDatabase();
    const courses = await Course.find({}).limit(3);
    return JSON.stringify(courses);
  } catch (error) {
    console.error(error);
    throw error;
  }
}
