import { NextRequest, NextResponse } from 'next/server';

// The API route handler for student authentication
export async function POST(request: NextRequest) {
  try {
    // Parse the form data
    const formData = await request.formData();
    const accessKey = formData.get('accessKey') as string;

    // Check if the access key is correct
    // The access key is hardcoded here for simplicity
    // In a real-world application, this would be stored securely
    if (accessKey !== 'wearethebest') {
      return NextResponse.json({ 
        success: false,
        message: 'Invalid access key. Please try again.'
      }, { status: 401 });
    }

    // If the access key is correct, return success
    return NextResponse.json({ 
      success: true, 
      redirectUrl: '/student-dashboard'
    }, { status: 200 });

  } catch (error) {
    console.error('Error in student authentication:', error);
    return NextResponse.json({ 
      success: false,
      message: 'An error occurred during authentication.'
    }, { status: 500 });
  }
} 