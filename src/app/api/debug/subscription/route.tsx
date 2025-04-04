// src/app/api/debug/subscription/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    const { action, recordId } = body;

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // User is authenticated
    const userId = session.user.id;
    const userEmail = session.user.email;

    let response;

    switch (action) {
      case "create":
        // Create a test subscription record
        response = await supabase
          .from("user_subscriptions")
          .insert({
            user_id: userId,
            user_email: userEmail,
            plan_name: "API Debug Test Subscription",
            subscription_name: "API Debug Test",
            billing_amount: 0,
            billing_period: "monthly",
            start_date: new Date().toISOString(),
            status: "debug",
            is_active: false,
            has_appointment_access: false,
            appointment_discount_percentage: 0,
            is_deleted: false
          })
          .select();
        break;

      case "read":
        // Read subscription records for the current user
        response = await supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", userId)
          .limit(5);
        break;

      case "update":
        if (!recordId) {
          return NextResponse.json(
            { success: false, error: "Record ID is required for update" },
            { status: 400 }
          );
        }

        // Update a specific record
        response = await supabase
          .from("user_subscriptions")
          .update({
            updated_at: new Date().toISOString(),
            is_active: true // Toggle this value
          })
          .eq("id", recordId)
          .eq("user_id", userId) // Security: ensure user can only update their own records
          .select();
        break;

      case "delete":
        if (!recordId) {
          return NextResponse.json(
            { success: false, error: "Record ID is required for delete" },
            { status: 400 }
          );
        }

        // Soft delete a specific record
        response = await supabase
          .from("user_subscriptions")
          .update({ is_deleted: true })
          .eq("id", recordId)
          .eq("user_id", userId) // Security: ensure user can only delete their own records
          .select();
        break;

      case "auth-status":
        // Return the current auth status
        return NextResponse.json({
          success: true,
          action: "auth-status",
          user: {
            id: userId,
            email: userEmail
          },
          session: {
            expires_at: session.expires_at,
            token_type: session.token_type
          }
        });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }

    // Check if there was an error with the Supabase operation
    if (response.error) {
      return NextResponse.json(
        { 
          success: false, 
          action, 
          error: response.error.message,
          details: response.error
        },
        { status: 500 }
      );
    }

    // Return the successful response
    return NextResponse.json({
      success: true,
      action,
      data: response.data || []
    });
  } catch (error: any) {
    console.error("API route error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "An unexpected error occurred",
        stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "API endpoint is working",
    user: {
      id: session.user.id,
      email: session.user.email
    }
  });
}