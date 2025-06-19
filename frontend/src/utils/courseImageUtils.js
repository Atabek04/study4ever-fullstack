export const techImages = [
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=400&q=80",
    "https://plus.unsplash.com/premium_photo-1663040543387-cb7c78c4f012?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1489875347897-49f64b51c1f8?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1595776613215-fe04b78de7d0?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1542315192-1f61a1792f33?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=400&q=80",
    "https://plus.unsplash.com/premium_photo-1661746658792-f45a2c46ad1b?auto=format&fit=crop&w=400&q=80",
    "https://plus.unsplash.com/premium_photo-1678565879444-f87c8bd9f241?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1623281185000-6940e5347d2e?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1498855926480-d98e83099315?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?auto=format&fit=crop&w=400&q=80",
];

export function getCourseImageUrl(course) {
    const hashInput = [
        course.id,
        course.title,
        course.instructorId,
        course.created_date,
        course.last_updated_date,
        (course.description ? course.description.substring(0, 20) : '')
    ].filter(Boolean).join('|');
    let hash = 5381;
    for (let i = 0; i < hashInput.length; i++) {
        hash = ((hash << 5) + hash) + hashInput.charCodeAt(i);
    }
    const idx = Math.abs(hash) % techImages.length;
    return techImages[idx];
}