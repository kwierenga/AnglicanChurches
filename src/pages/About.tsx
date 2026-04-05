export default function About(){
  return (
    <main className="max-w-3xl mx-auto p-6 prose">
      <h1>About this Project</h1>
      <p>
        This website catalogues Anglican churches across Jamaica — from grand cathedrals built in the colonial era
        to small mission chapels serving rural fishing villages, and even the ruins of churches long abandoned.
        It brings together maps, photographs, short histories, and heritage information in one place.
      </p>
      <p>
        The project is a work in progress. New churches, images, and historical details are added as sources are
        verified. If you have information, photographs, or corrections to contribute, we welcome your input.
      </p>

      <h2>The Anglican Church in Jamaica</h2>
      <p>
        The Anglican Church has been present in Jamaica since the English captured the island from Spain in 1655.
        Parish churches were established across the island as centres of worship, civic life, and colonial
        administration. For much of the colonial period, the Church of England was the established church of Jamaica.
      </p>
      <p>
        <strong>Emancipation (1834&ndash;1838)</strong> transformed the church's role. As formerly enslaved people
        gained freedom, congregations changed, schools were founded, and mission work expanded beyond the planter class.
        Anglican churches became community anchors in towns and villages across the island.
      </p>
      <p>
        Following <strong>Independence in 1962</strong>, the Anglican Church in Jamaica became part of the
        self-governing Church in the Province of the West Indies, within the worldwide Anglican Communion.
        Today the Diocese of Jamaica and the Cayman Islands oversees parishes across the island, maintaining
        historic buildings while serving modern congregations.
      </p>

      <h2>What You'll Find Here</h2>
      <ul>
        <li><strong>Interactive map</strong> &mdash; Browse churches on a satellite map. Click a marker to see details. Use the parish chips to filter by location.</li>
        <li><strong>Search &amp; filters</strong> &mdash; Search by name, or filter by parish, classification (cathedral, church, chapel, ruin), and status.</li>
        <li><strong>Church pages</strong> &mdash; Each church has a summary, history, architecture notes, worship information, and interesting facts.</li>
        <li><strong>Photographs</strong> &mdash; Images are sourced from field visits and archives, hosted on Cloudinary.</li>
      </ul>

      <h2>Sources &amp; Accuracy</h2>
      <p>
        Content draws on publications by the Jamaica National Heritage Trust, the Anglican Diocese of Jamaica
        and the Cayman Islands, the National Library of Jamaica, and established historical works. Where details
        could not be verified against primary sources, the text remains general rather than speculative.
      </p>
      <p className="text-sm text-gray-600">
        Church descriptions are written at an accessible reading level. Sources are cited in each church page's metadata.
      </p>
    </main>
  )
}
