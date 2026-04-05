import React from 'react'

export default function About(){
  return (
    <main className="max-w-3xl mx-auto p-6 prose">
      <h1>About this Project</h1>
      <p>
        This website gives a simple, clear view of Anglican churches in Jamaica.
        It brings together names, places, short histories, and photos so people can learn and explore.
      </p>
      <h2>The Anglican Church in Jamaica — A Short Overview</h2>
      <p>
        The Anglican Church arrived in Jamaica during the colonial period in the 1600s. Churches were built in towns and villages, often at the heart of local life.
      </p>
      <p>
        <strong>Emancipation (1834–1838)</strong> marked the end of slavery in the British Empire. During these years, many churches saw growth in schools and mission work, as communities changed and new voices were heard.
      </p>
      <p>
        In <strong>1962</strong>, Jamaica became an independent nation. The Anglican Church continued to serve people through worship, education, and care for those in need. Today, parishes work with local groups to keep buildings safe and to support community life.
      </p>

      <h2>How to Use the Site</h2>
      <ul>
        <li>Search by church name, or use the dropdowns for parish, classification, and status.</li>
        <li>Click the map to choose a church and zoom in. Clear filters to see the whole island again.</li>
        <li>Each church page includes a summary, history, structure/architecture, worship &amp; clergy, and interesting facts.</li>
      </ul>

      <p className="text-sm text-gray-600">
        Notes are written at an early high-school reading level. Citations appear at the end of each church page.
      </p>
    </main>
  )
}
