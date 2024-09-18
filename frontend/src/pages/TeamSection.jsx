import React from 'react';
import mainPhoto from '../assets/mainPhoto.jpg'; // Placeholder image for main team member
import teamMember1 from '../assets/teamMember1.jpg'; // Placeholder image for team member 1
import teamMember2 from '../assets/teamMember2.jpg'; // Placeholder image for team member 2
import teamMember3 from '../assets/teamMember3.jpg'; // Placeholder image for team member 3

const TeamSection = () => {
  return (
    <div className="bg-[#0F172A] min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Main Team Member Section */}
        <div className="flex flex-col items-center mb-12">
          <img
            src={mainPhoto}
            alt="Main Team Member"
            className="w-64 h-64 object-cover object-top rounded-full shadow-lg mb-4 relative z-10"
          />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Prof. A.K. Swamy
          </h2>
          <p className="text-gray-400 mb-4">
            Professor, Dept. of Civil Engineering
          </p>
          <p className="text-gray-300 text-center max-w-2xl">
            Prof. A.K. Swamy is a Professor in the Department of Civil Engineering at the Indian Institute of Technology (IIT) Delhi. 
            His office is located in Room Number 332, Block IV, IIT Delhi, Hauz Khas, South Delhi. 
            His research focuses on civil engineering topics, and he is involved in various projects and research initiatives.
            <br/><br/>
            Contact Information:
            <br/>
            Email: akswamy[at]civil.iitd.ac.in <br/>
            Tel: (91)-11-2659-1191 (Office), (91)-11-2659-6265 (Lab) <br/>
            Fax: (91)-11-2658-1117 <br/>
            Webpage: <a href="http://web.iitd.ac.in/~akswamy" className="text-blue-500">http://web.iitd.ac.in/~akswamy</a>
          </p>
        </div>

        {/* Other Team Members Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <img
              src={teamMember1}
              alt="Team Member 1"
              className="w-40 h-40 object-cover rounded-full shadow-lg mb-2"
            />
            <h3 className="text-xl font-bold text-white">Sudhanshu Kumar</h3>
          {/* <p className="text-gray-400">Associate Professor</p> */}
          </div>

          <div className="flex flex-col items-center">
            <img
              src={teamMember2}
              alt="Team Member 2"
              className="w-40 h-40 object-cover rounded-full shadow-lg mb-2"
            />
            <h3 className="text-xl font-bold text-white">Srijan Kumar</h3>
            {/* <p className="text-gray-400">Research Scientist</p> */}
          </div>

          {/* <div className="flex flex-col items-center">
            <img
              src={teamMember3}
              alt="Team Member 3"
              className="w-40 h-40 object-cover rounded-full shadow-lg mb-2"
            />
            <h3 className="text-xl font-bold text-white">Dr. Emily Davis</h3>
            <p className="text-gray-400">Postdoctoral Fellow</p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default TeamSection;
