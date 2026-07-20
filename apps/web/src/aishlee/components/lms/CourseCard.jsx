'use client';
import React, { useState } from 'react';
import { Clock, Download, CheckCircle, Award, BookOpen, Star, Sparkles, Brain, Edit, Trash2, Share2, PlayCircle, FileText, Check } from 'lucide-react';

// Premium Interactive Course Card (Udemy/Unacademy Style)
const CourseCard = ({
  course,
  isAdmin,
  currentUser,
  unlockedCourses,
  handleEditCourse,
  handleDeleteCourse,
  setActiveCourse,
  handleShare,
  unlockingCourseId,
  setUnlockingCourseId,
  accessCodeInput,
  setAccessCodeInput,
  handleUnlockCourse,
  userPurchases,
  setPurchaseModal,
}) => {
  const [expanded, setExpanded] = useState(false);

  const pendingPurchase = userPurchases?.find(
    (p) =>
      String(p.item_id) === String(course.id) &&
      String(p.status).toUpperCase() === "PENDING",
  );
  const approvedPurchase = userPurchases?.find(
    (p) =>
      String(p.item_id) === String(course.id) &&
      String(p.status).toUpperCase() === "APPROVED",
  );

  const isUnlocked =
    course.price === 0 ||
    isAdmin ||
    unlockedCourses.includes(course.id) ||
    approvedPurchase;

  let curriculumObj = null;
  if (
    course.curriculum &&
    Array.isArray(course.curriculum) &&
    course.curriculum.length > 0
  ) {
    curriculumObj = course.curriculum;
  }

  const totalTopics = curriculumObj
    ? curriculumObj.reduce((acc, mod) => acc + (mod.topics?.length || 0), 0)
    : 0;
  const isQuiz = course.type === "Quiz Creator";
  const isTest = course.type === "Test Series";

  // Use a deterministic gradient based on course ID for the thumbnail placeholder
  const gradientId = (course.id || 0) % 5;
  const gradients = [
    "linear-gradient(135deg, #0F2027, #203A43, #2C5364)", // Dark Blue
    "linear-gradient(135deg, #141E30, #243B55)", // Midnight
    "linear-gradient(135deg, #4b6cb7, #182848)", // Ocean
    "linear-gradient(135deg, #000000, #0f9b0f)", // Hacker Green
    "linear-gradient(135deg, #870000, #190A05)", // Dark Red
  ];

  const headerIcon = isQuiz ? (
    <Brain size={48} color="rgba(255,255,255,0.2)" />
  ) : isTest ? (
    <CheckCircle size={48} color="rgba(255,255,255,0.2)" />
  ) : (
    <BookOpen size={48} color="rgba(255,255,255,0.2)" />
  );
  const getStylizedTitle = (title) => {
    if (!title) return "LMS";
    
    let mainPart = title;
    let subPart = "";

    if (title.toUpperCase().includes("COMPLETE COURSE")) {
      const idx = title.toUpperCase().indexOf("COMPLETE COURSE");
      mainPart = title.substring(0, idx).trim();
      subPart = "Complete Course";
    } else if (title.includes("-")) {
      const parts = title.split("-");
      mainPart = parts[0].trim();
      subPart = parts[1].trim();
    } else if (title.includes("&")) {
      const parts = title.split("&");
      mainPart = parts[0].trim();
      subPart = "& " + parts.slice(1).join("&").trim();
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "center", width: "100%" }}>
        <span style={{
          fontSize: mainPart.length > 18 ? "18px" : "24px",
          fontWeight: "900",
          background: "linear-gradient(90deg, var(--tech-cyan), var(--tech-gold))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0px 4px 20px rgba(0,229,255,0.3)",
          letterSpacing: "1px",
          textTransform: "uppercase",
          lineHeight: "1.2"
        }}>
          {mainPart}
        </span>
        {subPart && (
          <span style={{
            fontSize: "12px",
            fontWeight: "600",
            color: "rgba(255,255,255,0.7)",
            letterSpacing: "2px",
            textTransform: "uppercase",
            background: "rgba(0,0,0,0.4)",
            padding: "2px 8px",
            borderRadius: "12px"
          }}>
            {subPart}
          </span>
        )}
      </div>
    );
  };


  return (
    <div
      className="glass-panel"
      style={{
        padding: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        cursor: "pointer",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
      }}
      onClick={() =>
        isUnlocked
          ? setActiveCourse(course)
          : setPurchaseModal({
              isOpen: true,
              course: course,
              paymentId: "",
              accessCodeInput: "",
              appliedDiscount: 0,
              appliedCode: null,
            })
      }
    >
      {/* Thumbnail Area */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "160px",
          background: "linear-gradient(135deg, #0B1015, #1A202C)",
          borderBottom: "1px solid rgba(0, 229, 255, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center"
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: "800",
            lineHeight: "1.3",
            background: "linear-gradient(90deg, var(--tech-cyan), var(--tech-gold))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0px 4px 20px rgba(0,229,255,0.3)"
          }}
        >
          {getStylizedTitle(course.title)}
        </h3>

        {/* Badges */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            display: "flex",
            gap: "8px",
          }}
        >
          {isAdmin && (
            <span
              style={{
                background: course.isComplete !== false ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                color: course.isComplete !== false ? "#10B981" : "#EF4444",
                border: `1px solid ${course.isComplete !== false ? "#10B981" : "#EF4444"}`,
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: "bold",
              }}
            >
              {course.isComplete !== false ? "COMPLETE" : "INCOMPLETE"}
            </span>
          )}
          {course.price === 0 && (
            <span
              style={{
                background: "#10B981",
                color: "white",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: "bold",
              }}
            >
              FREE
            </span>
          )}
          {course.type === "Course" && (
            <span
              style={{
                background: "var(--tech-gold)",
                color: "black",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: "bold",
              }}
            >
              BESTSELLER
            </span>
          )}
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              display: "flex",
              gap: "8px",
              background: "rgba(0,0,0,0.6)",
              padding: "4px",
              borderRadius: "8px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => handleEditCourse(e, course)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--tech-cyan)",
                padding: "4px",
              }}
              title="Edit"
            >
              <Edit size={16} />
            </button>
            {currentUser?.role === "Super Admin" && (
              <button
                onClick={(e) => handleDeleteCourse(e, course.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#EF4444",
                  padding: "4px",
                }}
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: "var(--cool-gray)",
              fontWeight: "500",
            }}
          >
            {course.type}
          </span>
          <span
            style={{
              fontSize: "12px",
              color: "var(--cool-gray)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Clock size={12} />{" "}
            {totalTopics > 0
              ? `${totalTopics} Lessons`
              : new Date(course.created_at).toLocaleDateString()}
          </span>
        </div>

        <h3
          style={{
            fontSize: "18px",
            color: "white",
            margin: "0 0 8px 0",
            lineHeight: "1.4",
            fontWeight: "700",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {(() => {
            const getTamilTitle = (title) => {
              const t = (title || "").toUpperCase();
              if (t.includes("TNPSC GROUP 1")) return "TNPSC குரூப் 1 முழுமையான பயிற்சி";
              if (t.includes("TNPSC GROUP 4")) return "TNPSC குரூப் 4 & VAO முழுமையான பயிற்சி";
              if (t.includes("COMPUTER")) return "கணினி செயல்பாடுகள் & அலுவலக தொகுப்பு - மேம்பட்ட பயிற்சி";
              if (t.includes("HANDCRAFTING")) return "கைவினை மற்றும் சிறு தொழில் - மேம்பட்ட பயிற்சி";
              return title;
            };
            return getTamilTitle(course.title);
          })()}
        </h3>

        <div
          style={{
            fontSize: "13px",
            color: "var(--cool-gray)",
            marginBottom: "12px",
          }}
        >
          By {course.profiles?.full_name || "Aishlee Expert"}
        </div>

        {/* Star Rating */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginBottom: "16px",
          }}
        >
          <span
            style={{ color: "#F59E0B", fontWeight: "bold", fontSize: "14px" }}
          >
            4.8
          </span>
          <div style={{ display: "flex", color: "#F59E0B" }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} style={{ fontSize: "14px" }}>
                ★
              </span>
            ))}
          </div>
          <span
            style={{
              color: "var(--cool-gray)",
              fontSize: "12px",
              marginLeft: "4px",
            }}
          >
            (1,245 ratings)
          </span>
        </div>

        {/* Price & Action */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            {course.price > 0 ? (
              <>
                <span
                  style={{
                    fontSize: "22px",
                    fontWeight: "900",
                    color: "white",
                  }}
                >
                  ₹{course.price}
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    color: "var(--cool-gray)",
                    textDecoration: "line-through",
                  }}
                >
                  ₹{course.price * 2}
                </span>
              </>
            ) : (
              <span
                style={{ fontSize: "22px", fontWeight: "900", color: "white" }}
              >
                Free
              </span>
            )}
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            {isUnlocked ? (
              <button
                className="btn-primary hover-glow"
                onClick={() => setActiveCourse(course)}
                style={{
                  background: "var(--tech-cyan)",
                  color: "black",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Go to Course
              </button>
            ) : pendingPurchase ? (
              <span
                style={{
                  color: "var(--tech-gold)",
                  fontSize: "13px",
                  fontWeight: "bold",
                }}
              >
                Pending Approval
              </span>
            ) : (
              <button
                className="btn-outline hover-glow"
                onClick={() =>
                  setPurchaseModal({
                    isOpen: true,
                    course: course,
                    paymentId: "",
                    accessCodeInput: "",
                    appliedDiscount: 0,
                    appliedCode: null,
                  })
                }
                style={{
                  borderColor: "white",
                  background: "transparent",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Buy Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default CourseCard;
