import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { AiOutlineDown, AiOutlineUp } from 'react-icons/ai';

const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (dropdown) => {
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  return (
    <>
      <div className='md:flex justify-between p-6 items-center flex-col '>
        <div className='flex gap-5 items-center flex-grow md:flex-none'>
          <h1 className='font-bold text-blue-900 text-5xl'>placedIn</h1>
          <div className='relative flex-grow md:flex-grow-0 w-full h-9 border rounded-md border-solid flex items-center mt-2 md:mt-0'>
            <input
              placeholder='Explore Courses'
              type='text'
              className='w-full h-full px-3 py-2 border border-solid border-blue-700 rounded-md focus:outline-none'
            />
            <button className='absolute right-0 top-0 h-full flex items-center bg-blue-900 p-2 rounded-r-md text-white hover:text-blue-900'>
              <FaSearch />
            </button>
          </div>
        </div>

        <div className='flex gap-3 items-center mt-4 md:mt-0'>
          <div className='flex text-sm gap-2'>
            {/* Working Professional Dropdown */}
            <div className='relative'>
              <p
                onClick={() => toggleDropdown('working')}
                className='cursor-pointer flex items-center gap-1 hover:text-blue-900'>
                Working Professional {openDropdown === 'working' ? <AiOutlineUp /> : <AiOutlineDown />}
              </p>
              {openDropdown === 'working' && (
                <div className='absolute bg-blue-50 z-10 mt-2  border rounded shadow-md'>
                  <p className='px-4 py-2 hover:bg-gray-100 hover:text-blue-900'>Option 1</p>
                  <p className='px-4 py-2 hover:bg-gray-100 hover:text-blue-900'>Option 2</p>
                  <p className='px-4 py-2 hover:bg-gray-100 hover:text-blue-900'>Option 3</p>
                </div>
              )}
            </div>

            {/* College Students Dropdown */}
            <div className='relative'>
              <p
                onClick={() => toggleDropdown('college')}
                className='cursor-pointer flex items-center gap-1 hover:text-blue-900'>
                College Students {openDropdown === 'college' ? <AiOutlineUp /> : <AiOutlineDown />}
              </p>
              {openDropdown === 'college' && (
                <div className='absolute mt-2 bg-blue-50 z-10 border rounded shadow-md'>
                  <p className='px-4 py-2 hover:bg-gray-100 hover:text-blue-900'>Option A</p>
                  <p className='px-4 py-2 hover:bg-gray-100 hover:text-blue-900'>Option B</p>
                  <p className='px-4 py-2 hover:bg-gray-100 hover:text-blue-900'>Option C</p>
                </div>
              )}
            </div>

            {/* Static Link */}
            <p>About</p>
          </div>

          <div className='flex items-center gap-3'>
            <button className='p-3 text-sm border rounded-md hover:text-blue-900 hover:border-blue-900'>
              Free Courses
            </button>

            <div className='btn-group dropleft'>
              <button
                type='button'
                className='btn btn-secondary dropdown-toggle rounded-full'
                data-toggle='dropdown'
                aria-haspopup='true'
                aria-expanded='false'>
                k
              </button>
              <div className='dropdown-menu'>
                <p className='px-4 py-2 hover:bg-gray-100'>Profile</p>
                <p className='px-4 py-2 hover:bg-gray-100'>Courses</p>
                <p className='px-4 py-2 hover:bg-gray-100'>Dropdown Item 3</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
