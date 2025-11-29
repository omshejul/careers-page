# Customizable careers page builder for companies
job posting management + application tracking
key feature: draft vs. live edit safely before publishing

Stack:
next.js tailwind
db: mongodb + mongoose
auth: nextauth (google oauth)
storage: aws s3

how draft/live works
draft: edit data, order, enabled fields
publish: copies to publishedData, publishedOrder, publishedEnabled
preview: authenticated users see draft
public: visitors only see published fields

main models
company: slug, name, logo, colors
section: page content blocks (hero, about, jobs, etc.)
job: postings with title, description, location
application: candidate submissions with resume

testing priorities
1 draft → publish flow (main feature)
2 job application submission (public-facing)
3 permissions (who can edit what)
4 performance (image loading, animations)
