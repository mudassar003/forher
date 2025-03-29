// src/sanity/schemaTypes/index.ts
import { type SchemaTypeDefinition } from 'sanity'

import {blockContentType} from './blockContentType'
import {categoryType} from './categoryType'
import {postType} from './postType'
import {authorType} from './authorType'
import {productType} from './productType'
import {productCategoryType} from './productCategoryType'
import {orderType} from './orderType'
import {subscriptionType} from './subscriptionType'
import {subscriptionCategoryType} from './subscriptionCategoryType'
import {appointmentType} from './appointmentType'
import {userSubscriptionType} from './userSubscriptionType'
import {userAppointmentType} from './userAppointmentType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContentType, 
    categoryType, 
    postType, 
    authorType, 
    productType, 
    productCategoryType, 
    orderType,
    subscriptionType,
    subscriptionCategoryType,
    appointmentType,
    userSubscriptionType,
    userAppointmentType
  ],
}