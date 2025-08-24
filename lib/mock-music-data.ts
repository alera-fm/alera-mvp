export interface Release {
  id: string
  trackTitle: string
  artistName: string
  releaseDate: string
  submissionDate: string
  status: "Live" | "Under Review" | "Draft" | "Rejected"
  streams: number
  revenue: number
  platforms: string[]
  artwork: string
  genre: string
  secondaryGenre?: string
  label: string
  copyright: string
  upcEan?: string
  explicitContent: boolean
  credits: {
    producers: string[]
    writers: string[]
    composers: string[]
    engineers: string[]
    mixedBy: string[]
    masteredBy: string[]
    featuredArtists: string[]
  }
  lyrics?: string
}

export const genreOptions = [
  "Pop",
  "Rock",
  "Hip Hop",
  "R&B",
  "Electronic",
  "Country",
  "Jazz",
  "Classical",
  "Folk",
  "Reggae",
  "Blues",
  "Funk",
  "Alternative",
  "Indie",
  "World Music",
  "Latin",
  "Gospel",
  "Punk",
  "Metal",
  "Disco",
]

export const mockReleases: Release[] = [
  {
    id: "1",
    trackTitle: "Midnight Dreams",
    artistName: "Luna Echo",
    releaseDate: "2024-03-15T00:00:00.000Z",
    submissionDate: "2024-03-10T00:00:00.000Z",
    status: "Live",
    streams: 125420,
    revenue: 892.15,
    platforms: ["Spotify", "Apple Music", "YouTube Music", "Amazon Music"],
    artwork: "/placeholder.svg?height=300&width=300&text=Midnight+Dreams",
    genre: "Electronic",
    secondaryGenre: "Pop",
    label: "Independent",
    copyright: "(c) Luna Echo 2024",
    upcEan: "5054960352322",
    explicitContent: false,
    credits: {
      producers: ["Alex Rivera", "Sam Chen"],
      writers: ["Luna Echo", "Maya Patel"],
      composers: ["Luna Echo"],
      engineers: ["Jordan Kim"],
      mixedBy: ["Alex Rivera"],
      masteredBy: ["Sarah Johnson"],
      featuredArtists: [],
    },
    lyrics: `[Verse 1]
In the silence of the night
Dreams are calling out my name
Shadows dancing in moonlight
Nothing ever feels the same

[Chorus]
Midnight dreams are calling me
To a place I've never been
In the darkness I can see
All the light that lies within

[Verse 2]
Stars are whispering secrets
Of the stories yet untold
In this moment I can feel it
All the magic to unfold

[Chorus]
Midnight dreams are calling me
To a place I've never been
In the darkness I can see
All the light that lies within`,
  },
  {
    id: "2",
    trackTitle: "City Lights",
    artistName: "Nova Kay",
    releaseDate: "2024-02-28T00:00:00.000Z",
    submissionDate: "2024-02-20T00:00:00.000Z",
    status: "Live",
    streams: 89340,
    revenue: 634.28,
    platforms: ["Spotify", "Apple Music", "Deezer"],
    artwork: "/placeholder.svg?height=300&width=300&text=City+Lights",
    genre: "Pop",
    secondaryGenre: "R&B",
    label: "Stellar Records",
    copyright: "(c) Nova Kay 2024",
    upcEan: "5054960352323",
    explicitContent: false,
    credits: {
      producers: ["Marcus Williams"],
      writers: ["Nova Kay", "Lisa Thompson"],
      composers: ["Nova Kay", "Marcus Williams"],
      engineers: ["David Park"],
      mixedBy: ["Marcus Williams"],
      masteredBy: ["Emily Davis"],
      featuredArtists: ["Jay Rivers"],
    },
    lyrics: `[Verse 1]
Walking through the city streets tonight
Neon signs are painting colors bright
Every corner tells a different story
In this urban territory

[Chorus]
City lights are shining down on me
Illuminating who I'm meant to be
In this concrete jungle I call home
I'm never really alone

[Verse 2]
Traffic sounds like music to my ears
All my hopes and all my fears
Come alive beneath these glowing towers
In these midnight hours`,
  },
  {
    id: "3",
    trackTitle: "Ocean Waves",
    artistName: "Coastal Drift",
    releaseDate: "2024-01-10T00:00:00.000Z",
    submissionDate: "2024-01-05T00:00:00.000Z",
    status: "Under Review",
    streams: 45230,
    revenue: 321.45,
    platforms: ["Spotify", "YouTube Music"],
    artwork: "/placeholder.svg?height=300&width=300&text=Ocean+Waves",
    genre: "Folk",
    secondaryGenre: "Indie",
    label: "Independent",
    copyright: "(c) Coastal Drift 2024",
    explicitContent: false,
    credits: {
      producers: ["Tom Anderson"],
      writers: ["Coastal Drift"],
      composers: ["Coastal Drift"],
      engineers: ["Rachel Green"],
      mixedBy: ["Tom Anderson"],
      masteredBy: ["Mike Wilson"],
      featuredArtists: [],
    },
    lyrics: `[Verse 1]
Listen to the ocean waves
Crashing on the shore
Every sound the water makes
Leaves me wanting more

[Chorus]
Take me to the water's edge
Where the sea meets sky
In this moment I can pledge
To let my spirit fly

[Verse 2]
Salt air fills my lungs with life
Washing all my cares away
In this peace I find no strife
Just the promise of today`,
  },
  {
    id: "4",
    trackTitle: "Thunder Road",
    artistName: "Electric Storm",
    releaseDate: "2023-12-05T00:00:00.000Z",
    submissionDate: "2023-11-28T00:00:00.000Z",
    status: "Live",
    streams: 203450,
    revenue: 1456.78,
    platforms: ["Spotify", "Apple Music", "YouTube Music", "Amazon Music", "Tidal"],
    artwork: "/placeholder.svg?height=300&width=300&text=Thunder+Road",
    genre: "Rock",
    secondaryGenre: "Alternative",
    label: "Thunder Records",
    copyright: "(c) Electric Storm 2023",
    upcEan: "5054960352324",
    explicitContent: true,
    credits: {
      producers: ["Jake Morrison", "Chris Taylor"],
      writers: ["Electric Storm", "Jake Morrison"],
      composers: ["Electric Storm"],
      engineers: ["Anna Rodriguez"],
      mixedBy: ["Chris Taylor"],
      masteredBy: ["Steve Miller"],
      featuredArtists: [],
    },
    lyrics: `[Verse 1]
Racing down the thunder road
Lightning in my veins
Every mile a story told
Breaking all the chains

[Chorus]
Thunder road is calling me
To ride into the storm
In the chaos I am free
This is where I'm born

[Verse 2]
Engine roaring like a beast
Headlights cut the night
In this moment I'm released
Everything's alright`,
  },
  {
    id: "5",
    trackTitle: "Golden Hour",
    artistName: "Sunset Valley",
    releaseDate: "2023-11-20T00:00:00.000Z",
    submissionDate: "2023-11-15T00:00:00.000Z",
    status: "Draft",
    streams: 0,
    revenue: 0,
    platforms: [],
    artwork: "/placeholder.svg?height=300&width=300&text=Golden+Hour",
    genre: "Country",
    secondaryGenre: "Folk",
    label: "Independent",
    copyright: "(c) Sunset Valley 2023",
    explicitContent: false,
    credits: {
      producers: ["Billy Hayes"],
      writers: ["Sunset Valley", "Mary Johnson"],
      composers: ["Sunset Valley"],
      engineers: ["Pete Collins"],
      mixedBy: ["Billy Hayes"],
      masteredBy: ["Linda Brown"],
      featuredArtists: [],
    },
    lyrics: `[Verse 1]
In the golden hour light
Everything looks perfect here
All my worries take their flight
When the sunset draws near

[Chorus]
Golden hour, paint the sky
With your warm and gentle glow
In this moment time stands by
And my heart begins to know

[Verse 2]
Fields of wheat are swaying slow
In the evening summer breeze
This is all I need to know
Simple moments bring me peace`,
  },
]
