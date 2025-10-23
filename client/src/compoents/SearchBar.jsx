import React from 'react'
import './SearchBar.scss'
function SearchBar() {
  return (
    <div className='Career-SearchBar'>
        <input type="text" placeholder='Enter a job title or a career path, ie: Software Engineer or Software Architect' />
        <button>Start Learning</button>
    </div>
  )
}

export default SearchBar