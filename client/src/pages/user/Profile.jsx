import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
const Profile = () => {
  const { user: userData } = useSelector((state) => state.user);

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Welcome,{" "}
            <span className="text-primary font-mono tracking-widest">
              {userData.name}
            </span>
          </h1>
          <p className="text-sm font-semibold text-gray-500">
            {userData.email}
          </p>
        </div>
        <Link
          to={"/user/settings"}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light"
        >
          Edit Profile
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-primary-light/30 p-4 rounded-lg hover:shadow-neumorphic transition-all duration-500 ease-in-out">
          <div className="flex items-center space-x-4">
            <span className="text-orange-500 text-4xl">🌕</span>
            <div>
              <p className="text-base font-semibold text-gray-500">Coins</p>
              <h3 className="text-lg font-bold text-primary-light">
                {userData.coins}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white border border-primary-light/30 p-4 rounded-lg hover:shadow-neumorphic transition-all duration-500 ease-in-out">
          <div className="flex items-center space-x-4">
            <span className="text-blue-500 text-4xl">📘</span>
            <div>
              <p className="text-base font-semibold text-gray-500">
                Ongoing Courses
              </p>
              <h3 className="text-lg font-bold text-primary-light">
                {userData.ongoingCourses.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white border border-primary-light/30 p-4 rounded-lg hover:shadow-neumorphic transition-all duration-500 ease-in-out">
          <div className="flex items-center space-x-4">
            <span className="text-green-500 text-5xl">🎓</span>
            <div>
              <p className="text-base font-semibold text-gray-500">
                Exams Attempted
              </p>
              <h3 className="text-lg font-bold text-primary-light">
                {userData.examsAttempted.length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Ongoing Courses */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-300">
        <h2 className="text-xl font-bold text-gray-800">Ongoing Courses</h2>
        <div className="mt-4">
          {userData?.ongoingCourses?.map((course) => (
            <div key={course.courseId} className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold capitalize text-primary">
                  {course.courseName}
                </h3>
                <Link
                  to={`/courseDetail/${course.courseId}`}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light"
                >
                  Continue Learning
                </Link>
              </div>
              <p className="text-sm font-normal text-gray-500">
                Progress:{" "}
                {(
                  (course.chapters.filter((ch) => ch.isCurrent).length /
                    course.chapters.length) *
                  100
                ).toFixed(0)}
                %
              </p>
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${
                      (course.chapters.filter((ch) => ch.isCurrent).length /
                        course.chapters.length) *
                      100
                    }%`,
                  }}
                ></div>
              </div>

              {/* Chapter Details */}
              <div className="mt-4 space-y-2">
                {course.chapters.map((chapter, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm text-gray-600"
                  >
                    <p className="flex items-center">
                      <span
                        className={`mr-2 ${
                          chapter.isCompleted
                            ? "text-green-500"
                            : chapter.isCurrent
                            ? "text-orange-500"
                            : "text-gray-400"
                        }`}
                      >
                        {
                          // chapter.isCompleted
                          //   ? "✔️"
                          //   :
                          chapter.isCurrent ? "✔️" : "🎯"
                        }
                      </span>
                      {chapter.title}
                    </p>
                    <p>
                      {
                        // chapter.isCompleted
                        //   ? "Completed"
                        //   :
                        chapter.isCurrent ? "Completed" : "In Progress"
                      }
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Leaderboard (Placeholder) */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800">Leaderboard</h2>
        <div className="bg-white shadow-sm rounded-lg p-6 mt-4 border border-gray-300">
          <p className="text-gray-600">Leaderboard stats will be shown here.</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
