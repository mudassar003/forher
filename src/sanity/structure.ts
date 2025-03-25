import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Blog content
      S.listItem()
        .title('Blog')
        .child(
          S.list()
            .title('Blog')
            .items([
              S.documentTypeListItem('post').title('Posts'),
              S.documentTypeListItem('category').title('Categories'),
              S.documentTypeListItem('author').title('Authors'),
            ])
        ),
      
      // E-commerce
      S.listItem()
        .title('Products')
        .child(
          S.list()
            .title('Products')
            .items([
              S.documentTypeListItem('product').title('Products'),
              S.documentTypeListItem('productCategory').title('Categories'),
            ])
        ),
        
      // Orders
      S.documentTypeListItem('order').title('Orders'),
      
      // Subscriptions & Appointments
      S.listItem()
        .title('Subscriptions')
        .child(
          S.list()
            .title('Subscriptions')
            .items([
              S.documentTypeListItem('subscription').title('Subscription Plans'),
              S.documentTypeListItem('userSubscription').title('User Subscriptions'),
            ])
        ),
        
      S.listItem()
        .title('Appointments')
        .child(
          S.list()
            .title('Appointments')
            .items([
              S.documentTypeListItem('appointment').title('Appointment Types'),
              S.documentTypeListItem('userAppointment').title('User Appointments'),
            ])
        ),
      
      // Other content types
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !['post', 'category', 'author', 'product', 'productCategory', 'order', 'subscription', 'appointment', 'userSubscription', 'userAppointment'].includes(item.getId()!),
      ),
    ])