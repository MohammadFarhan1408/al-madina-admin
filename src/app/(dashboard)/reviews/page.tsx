import type { Metadata } from 'next'

import ReviewsView from '@views/reviews/ReviewsView'

export const metadata: Metadata = {
  title: 'Reviews — Al Madina Admin'
}

const ReviewsPage = () => <ReviewsView />

export default ReviewsPage
