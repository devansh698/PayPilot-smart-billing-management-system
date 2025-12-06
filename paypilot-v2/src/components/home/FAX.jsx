import React, { useState } from 'react';
import { Container, Accordion, AccordionItem, AccordionHeader, AccordionBody } from 'reactstrap';

const FAQ = () => {
    const [open, setOpen] = useState(0);

    const toggle = (index) => {
        setOpen(open === index ? 0 : index);
    };

    const faqData = [
        {
            question: "What is PayPilot?",
            answer: "PayPilot is a comprehensive financial management tool designed for small businesses and freelancers."
        },
        {
            question: "How do I create an account?",
            answer: "You can create an account by clicking on the 'Signup' button on the homepage and filling out the required information."
        },
        {
            question: "Is my data secure?",
            answer: "Yes, we prioritize your data security and use industry-standard encryption to protect your information."
        },
        {
            question: "Can I integrate PayPilot with other tools?",
            answer: "Absolutely! PayPilot offers integrations with various accounting and payment platforms."
        }
    ];

    return (
        <div className="faq" style={{ padding: '50px 20px', backgroundColor: '#f9f9f9' }}>
            <Container>
                <h1 className="text-center">Frequently Asked Questions</h1>
                <Accordion open={open}>
                    {faqData.map((item, index) => (
                        <AccordionItem key={index}>
                            <AccordionHeader onClick={() => toggle(index)}>
                                {item.question}
                            </AccordionHeader>
                            <AccordionBody>
                                {item.answer}
                            </AccordionBody>
                        </AccordionItem>
                    ))}
                </Accordion>
            </Container>
        </div>
    );
};

export default FAQ;