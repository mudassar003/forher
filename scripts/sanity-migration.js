// scripts/sanity-migration.js
// Run this script with: node scripts/sanity-migration.js

// For CommonJS, replace these imports with require statements
const { createClient } = require('@sanity/client');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create a client with your project details
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_WRITE_TOKEN, // needs to be a write token
  useCdn: false, // We need to use the API directly for mutations
  apiVersion: '2025-03-03'
});

async function createDefaultSubscriptionPlans() {
  console.log('Creating default subscription plans...');
  
  const subscriptionPlans = [
    {
      _type: 'subscription',
      title: 'Basic Membership',
      slug: {
        _type: 'slug',
        current: 'basic-membership'
      },
      description: 'Basic membership with appointment booking access and exclusive content.',
      features: [
        {
          _key: '1',
          featureText: 'Access to appointment booking system'
        },
        {
          _key: '2',
          featureText: 'Member-only articles and resources'
        },
        {
          _key: '3',
          featureText: 'Monthly newsletter'
        },
        {
          _key: '4',
          featureText: '10% discount on appointments'
        }
      ],
      price: 29.99,
      billingPeriod: 'monthly',
      appointmentAccess: true,
      appointmentDiscountPercentage: 10,
      isActive: true
    },
    {
      _type: 'subscription',
      title: 'Premium Membership',
      slug: {
        _type: 'slug',
        current: 'premium-membership'
      },
      description: 'Premium membership with priority booking, increased discounts, and premium content.',
      features: [
        {
          _key: '1',
          featureText: 'Priority appointment scheduling'
        },
        {
          _key: '2',
          featureText: 'Access to all member content'
        },
        {
          _key: '3',
          featureText: 'Weekly personalized tips'
        },
        {
          _key: '4',
          featureText: 'Premium support'
        },
        {
          _key: '5',
          featureText: '20% discount on appointments'
        }
      ],
      price: 79.99,
      billingPeriod: 'monthly',
      appointmentAccess: true,
      appointmentDiscountPercentage: 20,
      isActive: true
    },
    {
      _type: 'subscription',
      title: 'Annual Premium',
      slug: {
        _type: 'slug',
        current: 'annual-premium'
      },
      description: 'Our best value subscription with all premium features and maximum savings.',
      features: [
        {
          _key: '1',
          featureText: 'All Premium membership features'
        },
        {
          _key: '2',
          featureText: 'Two months free compared to monthly billing'
        },
        {
          _key: '3',
          featureText: '25% discount on appointments'
        },
        {
          _key: '4',
          featureText: 'Exclusive annual member gifts'
        },
        {
          _key: '5',
          featureText: 'VIP customer service'
        }
      ],
      price: 799.99,
      billingPeriod: 'annually',
      appointmentAccess: true,
      appointmentDiscountPercentage: 25,
      isActive: true
    }
  ];
  
  for (const plan of subscriptionPlans) {
    try {
      // Check if plan already exists
      const existingPlan = await client.fetch(
        `*[_type == "subscription" && slug.current == $slug][0]`,
        { slug: plan.slug.current }
      );
      
      if (existingPlan) {
        console.log(`Plan "${plan.title}" already exists, skipping.`);
        continue;
      }
      
      // Create the plan
      const result = await client.create(plan);
      console.log(`Created plan: ${result.title} (ID: ${result._id})`);
    } catch (error) {
      console.error(`Error creating plan "${plan.title}":`, error.message);
    }
  }
}

async function createDefaultAppointmentTypes() {
  console.log('Creating default appointment types...');
  
  const appointmentTypes = [
    {
      _type: 'appointment',
      title: 'Initial Consultation',
      slug: {
        _type: 'slug',
        current: 'initial-consultation'
      },
      description: 'A comprehensive first appointment to assess your needs and create a personalized treatment plan.',
      price: 99.99,
      duration: 60,
      qualiphyExamId: 101, // Replace with your actual Qualiphy exam ID
      isActive: true
    },
    {
      _type: 'appointment',
      title: 'Follow-up Consultation',
      slug: {
        _type: 'slug',
        current: 'follow-up-consultation'
      },
      description: 'Regular follow-up appointments to track progress and adjust treatment as needed.',
      price: 49.99,
      duration: 30,
      qualiphyExamId: 102, // Replace with your actual Qualiphy exam ID
      isActive: true
    },
    {
      _type: 'appointment',
      title: 'Emergency Consultation',
      slug: {
        _type: 'slug',
        current: 'emergency-consultation'
      },
      description: 'Urgent care appointments for immediate concerns.',
      price: 149.99,
      duration: 45,
      qualiphyExamId: 103, // Replace with your actual Qualiphy exam ID
      isActive: true
    }
  ];
  
  for (const type of appointmentTypes) {
    try {
      // Check if appointment type already exists
      const existingType = await client.fetch(
        `*[_type == "appointment" && slug.current == $slug][0]`,
        { slug: type.slug.current }
      );
      
      if (existingType) {
        console.log(`Appointment type "${type.title}" already exists, skipping.`);
        continue;
      }
      
      // Create the appointment type
      const result = await client.create(type);
      console.log(`Created appointment type: ${result.title} (ID: ${result._id})`);
    } catch (error) {
      console.error(`Error creating appointment type "${type.title}":`, error.message);
    }
  }
}

async function main() {
  try {
    await createDefaultSubscriptionPlans();
    await createDefaultAppointmentTypes();
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

main();