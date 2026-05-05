import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import osQuestions from './data/os.json'
import dbmsQuestions from './data/dbms.json'
import cnQuestions from './data/cn.json'
import cQuestions from './data/c.json'
import linuxQuestions from './data/linux.json'
import './App.css'

const quizFiles = {
  os: {
    label: 'Operating Systems',
    questions: osQuestions,
  },
  dbms: {
    label: 'DBMS',
    questions: dbmsQuestions,
  },
  cn: {
    label: 'Computer Networks',
    questions: cnQuestions,
  },
  c: {
    label: 'C Programming',
    questions: cQuestions,
  },
  linux: {
    label: 'Linux',
    questions: linuxQuestions,
  },
}

function normalizeQuestion(item, index) {
  return {
    id: item.id ?? index,
    question: item.question ?? item.quesstion ?? item.quesion ?? '',
    options: Array.isArray(item.option) ? item.option : [],
    answer: item.answer ?? '',
    explanation: item.explanation ?? '',
  }
}

function createEmptyResponses(count) {
  return Array.from({ length: count }, () => null)
}

function Home() {
  const location = useLocation()

  return (
    <>
    <Analytics />
    <main className="shell">
      <section className="hero-card">
        <p className="eyebrow">Choose a route</p>
        <h1>We Help Everyone</h1>
        <p className="muted">
          Open a subject route to begin immediately. Each JSON file drives its own quiz.
        </p>

        <div className="subject-grid">
          {Object.entries(quizFiles).map(([slug, quiz]) => (
            <Link key={slug} className="subject-card" to={`/${slug}`}>
              <span>{quiz.label}</span>
              <strong>/{slug}</strong>
            </Link>
          ))}
        </div>

        <p className="route-hint">Current path: {location.pathname}</p>
      </section>
    </main>
    </>
  )
}

function QuizSummary({ quiz, questions, responses, onRetake }) {
  const rightAnswers = questions.filter((_, index) => responses[index]?.status === 'correct')
  const wrongAnswers = questions.filter((_, index) => responses[index]?.status === 'wrong')
  const skippedAnswers = questions.filter((_, index) => {
    const response = responses[index]
    return !response || response.status === 'skipped'
  })

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Quiz completed</p>
          <h1>{quiz.label}</h1>
        </div>
        <Link className="ghost-button" to="/">
          All subjects
        </Link>
      </header>

      <section className="quiz-card summary-card">
        <div className="result-grid">
          <div className="result-chip success">
            <span>Right</span>
            <strong>{rightAnswers.length}</strong>
          </div>
          <div className="result-chip danger">
            <span>Wrong</span>
            <strong>{wrongAnswers.length}</strong>
          </div>
          <div className="result-chip neutral">
            <span>Skipped</span>
            <strong>{skippedAnswers.length}</strong>
          </div>
        </div>

        {wrongAnswers.length > 0 ? (
          <section className="review-section">
            <h2>Questions to review</h2>
            <div className="review-list">
              {questions
                .map((question, index) => ({
                  question,
                  response: responses[index],
                  index,
                }))
                .filter(({ response }) => response?.status === 'wrong')
                .map(({ question, response, index }) => (
                  <article key={question.id} className="review-card">
                    <p className="review-index">Question {index + 1}</p>
                    <h3>{question.question}</h3>
                    <p className="review-line">
                      Your answer: <span>{response.answer}</span>
                    </p>
                    <p className="review-line">
                      Correct answer: <span>{question.answer}</span>
                    </p>
                    <p className="review-line explanation">{question.explanation}</p>
                  </article>
                ))}
            </div>
          </section>
        ) : (
          <section className="review-section">
            <h2>No wrong answers</h2>
            <p className="muted">You answered every attempted question correctly.</p>
          </section>
        )}

        {skippedAnswers.length > 0 ? (
          <section className="review-section">
            <h2>Skipped or unanswered</h2>
            <div className="review-list compact">
              {questions
                .map((question, index) => ({
                  question,
                  response: responses[index],
                  index,
                }))
                .filter(({ response }) => !response || response.status === 'skipped')
                .map(({ question, response, index }) => (
                  <article key={question.id} className="review-card muted-card">
                    <p className="review-index">Question {index + 1}</p>
                    <h3>{question.question}</h3>
                    <p className="review-line">
                      Status: <span>{response?.status === 'skipped' ? 'Skipped' : 'Unanswered'}</span>
                    </p>
                  </article>
                ))}
            </div>
          </section>
        ) : null}

        <div className="actions summary-actions">
          <button type="button" className="ghost-button" onClick={onRetake}>
            Review again
          </button>
          <Link className="primary-button" to={`/${quiz.slug}`}>
            Retake quiz
          </Link>
        </div>
      </section>
    </main>
  )
}

function QuizRoute({ subject }) {
  const quiz = quizFiles[subject]
  const questions = useMemo(
    () => (quiz?.questions ?? []).map(normalizeQuestion),
    [quiz],
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState(() => createEmptyResponses(questions.length))
  const [submitted, setSubmitted] = useState(false)
  const [mode, setMode] = useState('study')
  const currentQuestion = questions[currentIndex]
  const currentResponse = responses[currentIndex]
  const rightCount = responses.filter((response) => response?.status === 'correct').length
  const wrongCount = responses.filter((response) => response?.status === 'wrong').length
  const skippedCount = responses.filter(
    (response) => !response || response.status === 'skipped',
  ).length
  const isRapidFire = mode === 'rapid'

  useEffect(() => {
    if (!isRapidFire) {
      return undefined
    }

    if (!currentResponse || currentResponse.status !== 'correct') {
      return undefined
    }

    const timer = window.setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((value) => value + 1)
      } else {
        setSubmitted(true)
      }
    }, 650)

    return () => window.clearTimeout(timer)
  }, [currentIndex, currentResponse, isRapidFire, questions.length])


  if (!quiz) {
    return <Navigate to="/os" replace />
  }

  function updateResponse(nextResponse) {
    setResponses((previousResponses) => {
      const nextResponses = previousResponses.length === questions.length
        ? [...previousResponses]
        : createEmptyResponses(questions.length)

      nextResponses[currentIndex] = nextResponse
      return nextResponses
    })
  }

  function handleOptionClick(option) {
    if (!currentQuestion) {
      return
    }

    updateResponse({
      status: option === currentQuestion.answer ? 'correct' : 'wrong',
      answer: option,
    })
  }

  function handleSkip() {
    updateResponse({
      status: 'skipped',
      answer: null,
    })

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((value) => value + 1)
    }
  }

  function handlePrevious() {
    if (currentIndex > 0) {
      setCurrentIndex((value) => value - 1)
    }
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((value) => value + 1)
      return
    }

    setSubmitted(true)
  }

  function handleRetake() {
    setCurrentIndex(0)
    setResponses(createEmptyResponses(questions.length))
    setSubmitted(false)
  }

  function handleModeChange(nextMode) {
    setMode(nextMode)
    setCurrentIndex(0)
    setResponses(createEmptyResponses(questions.length))
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <QuizSummary
        quiz={{ ...quiz, slug: subject }}
        questions={questions}
        responses={responses}
        onRetake={handleRetake}
      />
    )
  }

  if (!currentQuestion) {
    return (
      <main className="shell">
        <section className="hero-card">
          <p className="eyebrow">{quiz.label}</p>
          <h1>No questions found</h1>
          <p className="muted">
            Add question objects to the matching JSON file to start the quiz.
          </p>
          <Link className="primary-button" to="/">
            Back to subjects
          </Link>
        </section>
      </main>
    )
  }

  const selectedAnswer = currentResponse?.answer ?? null
  const locked = Boolean(currentResponse)
  const isCorrect = currentResponse?.status === 'correct'

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">MCQ routes</p>
          <h1>{quiz.label}</h1>
        </div>
        <div className="topbar-actions">
          <div className="mode-switch" role="tablist" aria-label="Quiz mode">
            <button
              type="button"
              className={`mode-button ${!isRapidFire ? 'active' : ''}`}
              onClick={() => handleModeChange('study')}
            >
              Study mode
            </button>
            <button
              type="button"
              className={`mode-button ${isRapidFire ? 'active' : ''}`}
              onClick={() => handleModeChange('rapid')}
            >
              Rapid fire
            </button>
          </div>
          <Link className="ghost-button" to="/">
            All subjects
          </Link>
        </div>
      </header>

      <section className="quiz-card">
        <div className="quiz-meta">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span>{subject.toUpperCase()}</span>
        </div>

        <div className="score-strip">
          <span className="result-pill success">Right {rightCount}</span>
          <span className="result-pill danger">Wrong {wrongCount}</span>
          <span className="result-pill neutral">Skipped {skippedCount}</span>
        </div>

        <p className="mode-hint">
          {isRapidFire
            ? 'Rapid fire mode: correct answers advance automatically; wrong answers show the explanation.'
            : 'Study mode: explanations stay visible until you click Next.'}
        </p>

        <h2>{currentQuestion.question}</h2>

        <div className="options-grid">
          {currentQuestion.options.map((option) => {
            const state = !locked
              ? 'idle'
              : option === currentQuestion.answer
                ? 'correct'
                : option === selectedAnswer
                  ? 'wrong'
                  : 'idle'

            return (
              <button
                key={option}
                type="button"
                className={`option ${state}`}
                onClick={() => handleOptionClick(option)}
              >
                <span>{option}</span>
              </button>
            )
          })}
        </div>

        {locked && (!isRapidFire || currentResponse?.status !== 'correct') && (
          <section className={`feedback ${isCorrect ? 'correct' : 'wrong'}`}>
            <p>{isCorrect ? 'Correct answer.' : 'Wrong answer.'}</p>
            <p>{currentQuestion.explanation}</p>
          </section>
        )}

        {isRapidFire && currentResponse?.status === 'correct' ? (
          <section className="feedback correct rapid-feedback">
            <p>Correct answer.</p>
            <p>Moving to the next question.</p>
          </section>
        ) : null}

        <div className="actions">
          <button type="button" className="ghost-button" onClick={handlePrevious} disabled={currentIndex === 0}>
            Previous
          </button>
          <button type="button" className="ghost-button" onClick={handleSkip}>
            Skip
          </button>
          {!isRapidFire || currentResponse?.status !== 'correct' ? (
            <button type="button" className="primary-button" onClick={handleNext} disabled={!locked}>
              {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
            </button>
          ) : null}
        </div>
      </section>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:subject" element={<QuizRouteContainer />} />
    </Routes>
  )
}

function QuizRouteContainer() {
  const { subject } = useParams()

  return <QuizRoute key={subject} subject={subject} />
}

export default App
