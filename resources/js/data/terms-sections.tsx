import { type ReactNode } from 'react';

export interface Section {
    number: number;
    title: string;
    summary: string;
    content: ReactNode;
}

export const sections: Section[] = [
    {
        number: 1,
        title: 'Acceptance of Terms',
        summary:
            'By using KENHAVATE you agree to these Terms, which limit KeNHA\'s liability and include an arbitration clause. Please read carefully and consult legal counsel if needed.',
        content: (
            <div className="space-y-4 text-sm leading-relaxed">
                <p className="font-semibold text-black dark:text-white">
                    PLEASE READ THESE TERMS OF USE CAREFULLY. ACCESSING OR USING THIS WEBSITE,
                    CONSTITUTES ACCEPTANCE OF THESE TERMS OF USE (&ldquo;TERMS&rdquo;), AS SUCH MAY
                    BE REVISED BY KeNHA FROM TIME TO TIME, AND IS A BINDING AGREEMENT BETWEEN YOU,
                    THE USER (&ldquo;USER&rdquo;) AND KENYA NATIONAL HIGHWAYS AUTHORITY
                    (&ldquo;KeNHA&rdquo;) GOVERNING THE USE OF THE WEBSITE. YOU ARE ADVISED TO
                    CONSULT LEGAL COUNSEL SHOULD YOU NOT COMPREHEND ANY PART OF THIS AGREEMENT. IF
                    USER DOES NOT AGREE TO THESE TERMS, USER SHOULD NOT ACCESS OR USE THIS WEBSITE.
                    THESE TERMS CONTAIN DISCLAIMERS AND OTHER PROVISIONS TO THE EFFECT THAT:
                </p>

                <p className="font-semibold text-black dark:text-white">
                    A. LIMIT OUR LIABILITY TO USER:
                </p>

                <p className="text-gray dark:text-zinc-300">
                    These Terms apply to your access to, and use of, all or part of any website or
                    mobile application of KeNHA or its Contractors, Consultants, Service Providers
                    and affiliates (collectively, &ldquo;KeNHA&rdquo;), and any other site, mobile
                    application or online service where these Terms are posted (collectively, the
                    &ldquo;Sites&rdquo;). These Terms do not alter in any way the terms or conditions
                    of any other agreement you may have with KeNHA for products, services or
                    otherwise.
                </p>

                <p className="text-gray dark:text-zinc-300">
                    It is required by Law that all engagements on this site shall be governed by the
                    provisions of the Access to Information Act and the Data Protection Act, Laws of
                    Kenya.
                </p>

                <p className="text-gray dark:text-zinc-300">
                    In the event there is any conflict or inconsistency between these Terms and any
                    other terms of use that appear on the Sites, these Terms will govern. However, if
                    you navigate or are redirected away from the Sites to a third-party site, you may
                    be subject to alternative terms and conditions of use, as may be specified on
                    such site, which will govern your use of that site.
                </p>

                <p className="text-gray dark:text-zinc-300">
                    While we make reasonable efforts to provide accurate and timely information about
                    KeNHA on the Sites, you should not assume that the information is always up to
                    date or that the Sites contain all the relevant information available about
                    KeNHA. In particular, if you are making an investment decision owing to
                    information obtained with regards to KeNHA, please consult a number of different
                    sources.
                </p>

                <p className="text-gray dark:text-zinc-300">
                    These terms include an Arbitration provision that governs any disputes between
                    you and us. Unless you opt out, as described below, this provision will:
                </p>

                <ul className="list-disc space-y-1 pl-5 text-gray dark:text-zinc-300">
                    <li>Eliminate your right to a trial by court; and</li>
                    <li>
                        Substantially affect your rights, including preventing you from bringing,
                        joining or participating in class action or consolidated proceedings.
                    </li>
                </ul>

                <p className="text-gray dark:text-zinc-300">
                    You agree that we may provide notices, disclosures and amendments to these Terms
                    by electronic means, including by changing these Terms by posting revisions on
                    the Sites.
                </p>
            </div>
        ),
    },
    {
        number: 2,
        title: 'Eligibility & Account Registration',
        summary:
            'You must be at least 18 years old. You agree to provide accurate information, keep your account secure, and promptly report any security breaches.',
        content: (
            <div className="space-y-4 text-sm leading-relaxed">
                <p className="font-semibold text-black dark:text-white">B. ELIGIBILITY:</p>

                <p className="text-gray dark:text-zinc-300">
                    The Sites are not targeted towards, nor intended for use by, anyone under the age
                    of 18. A USER MUST BE AT LEAST AGE 18 TO ACCESS AND USE THE SITES. If the User
                    is between the ages of 13 and 18, he or she may only use the Sites under the
                    supervision of a parent or legal guardian who agrees to be bound by these Terms.
                </p>

                <p className="text-gray dark:text-zinc-300">
                    User represents and warrants that (a) he/she is not located in a country that is
                    subject to a Kenya government embargo, or that has been designated by the Kenya
                    government as a &ldquo;terrorist supporting&rdquo; country; and (b) he/she is not
                    listed on any Kenya government list of prohibited or restricted parties.
                </p>

                <p className="text-gray dark:text-zinc-300">
                    In order to participate in certain areas of our Sites, you will need to register
                    for an account. You agree to:
                </p>

                <ol className="list-decimal space-y-1 pl-5 text-gray dark:text-zinc-300">
                    <li>create only one account;</li>
                    <li>
                        provide accurate, truthful, current and complete information when creating
                        your account;
                    </li>
                    <li>maintain and promptly update your account information;</li>
                    <li>
                        maintain the security of your account by not sharing your password with
                        others and restricting access to your account and your computer;
                    </li>
                    <li>
                        promptly notify KeNHA if you discover or otherwise suspect any security
                        breaches relating to the Sites; and
                    </li>
                    <li>
                        take responsibility for all activities that occur under your account and
                        accept all risks of unauthorized access.
                    </li>
                </ol>
            </div>
        ),
    },
    {
        number: 3,
        title: 'Privacy & Communications',
        summary:
            'Your data is handled per the Privacy Policy consistent with Kenya\'s Data Protection Act. You may opt out of promotional emails at any time.',
        content: (
            <div className="space-y-4 text-sm leading-relaxed">
                <p className="font-semibold text-black dark:text-white">C. PRIVACY:</p>

                <p className="text-gray dark:text-zinc-300">
                    Please read the Privacy Policy carefully to understand how KeNHA collects, uses
                    and discloses personally identifiable information from its users. By accessing or
                    using the Sites, you consent to all actions that we take with respect to your
                    data consistent with our Privacy Policy.
                </p>

                <p className="font-semibold text-black dark:text-white">D. EMAIL COMMUNICATIONS:</p>

                <p className="text-gray dark:text-zinc-300">
                    If a User signs up for a KeNHA account on the Sites, the User is, by default,
                    opted in to receive promotional email communications from KeNHA (&ldquo;Email
                    Communications&rdquo;). The User may, at the time of sign up, opt out of
                    receiving Email Communications from KeNHA. Thereafter, the User may opt out of
                    receiving Email Communications by adjusting the User&rsquo;s profile settings in
                    the User&rsquo;s KeNHA account via www.kenha.co.ke.
                </p>
            </div>
        ),
    },
    {
        number: 4,
        title: 'Intellectual Property',
        summary:
            'All content on KENHAVATE is owned by KeNHA or its licensors. You receive a limited personal license to use the site. Copyright infringement reporting procedures are outlined.',
        content: (
            <div className="space-y-4 text-sm leading-relaxed">
                <p className="font-semibold text-black dark:text-white">
                    E. INTELLECTUAL PROPERTY &mdash; COPYRIGHT, TRADEMARKS, AND USER LICENSE:
                </p>

                <p className="text-gray dark:text-zinc-300">
                    Unless otherwise indicated, the Sites and all content and other materials therein,
                    including, without limitation, the KeNHA logo and all designs, text, graphics,
                    pictures, information, data, software, sound files, other files and the selection
                    and arrangement thereof (collectively, &ldquo;Site Materials&rdquo;) are the
                    property of KeNHA or its licensors or users and are protected by KENYA and
                    international copyright laws.
                </p>

                <p className="text-gray dark:text-zinc-300">
                    KeNHA, the KeNHA logo, and other KeNHA trademarks, service marks, graphics, and
                    logos used in connection with the Sites are trade names, trademarks or registered
                    trademarks of KeNHA (collectively &ldquo;KeNHA Marks&rdquo;). Other trademarks,
                    service marks, graphics and logos used in connection with the Sites are the
                    trademarks or registered trademarks of their respective owners (collectively
                    &ldquo;Third Party Marks&rdquo;). The KeNHA Marks and Third-Party Marks may not
                    be copied, imitated, or used, in whole or in part, without the prior written
                    permission of KeNHA or the applicable trademark holder.
                </p>

                <p className="text-gray dark:text-zinc-300">
                    The Sites and the Content are protected by copyright, trademark, patent, trade
                    secret, international treaties, state and federal laws, and other proprietary
                    rights and also may have security components that protect digital information
                    only as authorized by KeNHA or the owner of the Content. All rights not expressly
                    granted are reserved.
                </p>

                <p className="text-gray dark:text-zinc-300">
                    Subject to these Terms, KeNHA grants the User a personal, non-exclusive,
                    non-transferable, limited, and revocable license to use the Sites for personal
                    use only in accordance with these Terms (&ldquo;User License&rdquo;). Any use of
                    the Sites in any other manner, including, without limitation, resale, transfer,
                    modification or distribution of the Sites or text, pictures, music, barcodes,
                    video, data, hyperlinks, displays, and other content associated with the Sites
                    (&ldquo;Content&rdquo;) is prohibited. Unless explicitly stated herein, nothing
                    in these Terms shall be construed as conferring in any manner, whether by
                    implication, estoppel or otherwise, any title or ownership of, or exclusive
                    use-rights to, any intellectual property or other right and any goodwill
                    associated therewith.
                </p>

                <p className="text-gray dark:text-zinc-300">
                    If you believe any material available via the Sites infringes a copyright you own
                    or control, you may file a notification of such infringement with our Designated
                    Office as set forth below.
                </p>

                <div className="rounded-lg border border-gray/15 bg-beige/30 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
                    <p className="font-medium text-black dark:text-white">KeNHA:</p>
                    <p className="text-gray dark:text-zinc-300">
                        Director, Policy, Research and Compliance.
                        <br />
                        prc@kenha.co.ke
                        <br />
                        Block C, 4th Floor, Barabara Plaza,
                        <br />
                        Mazao Road, JKIA Airport,
                        <br />
                        Nairobi Kenya.
                    </p>
                </div>

                <p className="text-gray dark:text-zinc-300">
                    You should note that if you knowingly misrepresent in your notification that the
                    material or activity is infringing, you will be liable for any damages, including
                    costs and attorneys&rsquo; fees, incurred by us or the alleged infringer as the
                    result of our relying upon such misrepresentation in removing or disabling access
                    to the material or activity claimed to be infringing.
                </p>

                <p className="text-gray dark:text-zinc-300">
                    If a notice of copyright infringement has been filed against material posted by
                    you on the Sites, you may make a counter-notification with our Designated Office
                    listed above, provided that such counter-notification complies with the
                    requirements of KIPI. If KeNHA receives a valid counter-notification, it may
                    reinstate the removed or disabled material in accordance with the Kenya
                    Industrial Property Institute (KIPI).
                </p>

                <p className="text-gray dark:text-zinc-300">
                    In accordance with the KIPI and other applicable law, KeNHA has also adopted a
                    policy of terminating, in appropriate circumstances and in our sole discretion,
                    users who are deemed to be repeat infringers. KeNHA may also, in its sole
                    discretion, limit access to the Sites and/or terminate the accounts of any users
                    who infringe any intellectual property rights of others, whether or not there is
                    any repeat infringement.
                </p>
            </div>
        ),
    },
    {
        number: 5,
        title: 'Acceptable Use & User Content',
        summary:
            'You must use the site responsibly and may not post harmful, unlawful, or unauthorized content. You are solely responsible for content you submit.',
        content: (
            <div className="space-y-4 text-sm leading-relaxed">
                <p className="font-semibold text-black dark:text-white">F. ACCEPTABLE USE:</p>

                <p className="text-gray dark:text-zinc-300">
                    User&rsquo;s use of the Sites, any Content, and any information provided by the
                    User including user names and passwords, addresses, e-mail addresses, phone
                    number, financial information (such as credit card numbers), information related
                    to a KeNHA Card or employer name (&ldquo;User Information&rdquo;) transmitted in
                    connection with the Sites is limited to the contemplated functionality of the
                    Sites. In no event may the Sites be used in a manner that:
                </p>

                <ol className="list-decimal space-y-1 pl-5 text-gray dark:text-zinc-300">
                    <li>harasses, abuses, stalks, threatens, defames, or otherwise infringes or violates the rights of any other party;</li>
                    <li>is unlawful, fraudulent, or deceptive;</li>
                    <li>provides sensitive personal information unless specifically requested by KeNHA;</li>
                    <li>includes spam or any unsolicited advertising;</li>
                    <li>uses technology or other means to access KeNHA or Content that is not authorized by KeNHA;</li>
                    <li>uses or launches any automated system, including without limitation, &ldquo;robots,&rdquo; &ldquo;spiders,&rdquo; or &ldquo;offline readers&rdquo;;</li>
                    <li>attempts to introduce viruses or any other computer code, files, or programs that interrupt, destroy, or limit the functionality of any computer software, hardware, or telecommunications equipment;</li>
                    <li>attempts to gain unauthorized access to KeNHA&rsquo;s computer network or user accounts;</li>
                    <li>encourages conduct that would constitute a criminal offense or that gives rise to civil liability;</li>
                    <li>violates these Terms;</li>
                    <li>attempts to damage, disable, overburden, or impair KeNHA&rsquo;s servers or networks;</li>
                    <li>impersonates any person or entity or otherwise misrepresents your identity or affiliation with another person or entity; or</li>
                    <li>fails to comply with applicable third party terms.</li>
                </ol>

                <p className="text-gray dark:text-zinc-300">
                    KeNHA reserves the right, in its sole discretion, to terminate any User License,
                    terminate any User&rsquo;s participation in the Sites, remove Content, or assert
                    legal action with respect to Content or use of the Sites that KeNHA reasonably
                    believes is or might be in violation of these Terms, or KeNHA policies including
                    the KeNHA Card Terms and Conditions. KeNHA&rsquo;s failure or delay in taking
                    such actions does not constitute a waiver of its rights to enforce these Terms.
                </p>

                <p className="font-semibold text-black dark:text-white">G. USER CONTENT:</p>

                <p className="text-gray dark:text-zinc-300">
                    KeNHA does not control, take responsibility for or assume liability for any User
                    Content posted, stored or uploaded by you or any third party, or for any loss or
                    damage thereto, nor is KeNHA liable for any user conduct or any mistakes,
                    defamation, slander, libel, omissions, falsehoods, obscenity, pornography or
                    profanity you may encounter. The interactive areas are generally designed as open
                    and public community areas for connecting and sharing with other people. When you
                    participate in these areas, you understand that certain information and content
                    you choose to post may be displayed publicly. You are solely responsible for your
                    use of the Sites and agree to use the interactive areas at your own risk.
                </p>

                <p className="text-gray dark:text-zinc-300">
                    If you become aware of User Content that you believe violates these Terms (with
                    the exception of copyright infringement which is addressed in the KIPI Act), you
                    may report it by clicking on the &ldquo;Report Abuse&rdquo; or &ldquo;Flag&rdquo;
                    links located just below each piece of User Content. Enforcement of these Terms
                    however, is solely in our discretion and absence of enforcement in some instances
                    does not constitute a waiver of our right to enforce the Terms in other
                    instances.
                </p>

                <p className="text-gray dark:text-zinc-300">
                    Although KeNHA has no obligation to screen, edit or monitor any of the User
                    Content posted on the Sites, KeNHA reserves the right, and has absolute
                    discretion, to remove, screen or edit any User Content on the Sites at any time
                    and for any reason without notice. You are solely responsible for creating backup
                    copies and replacing any User Content you post or store on the Sites at your sole
                    cost and expense.
                </p>

                <p className="text-gray dark:text-zinc-300">
                    You represent and warrant that your User Content is not subject to any
                    confidentiality obligations and that you own and control all of the rights to the
                    User Content, have the lawful right to distribute and produce such User Content,
                    or otherwise have the right to grant the rights to KeNHA that you grant herein.
                    KeNHA claims no ownership or control over any User Content, except as otherwise
                    provided herein, on the Sites or in a separate agreement. However, by submitting
                    or posting User Content on the Sites, you grant KeNHA and its designees a
                    worldwide, perpetual, irrevocable, non-exclusive, fully-paid up and royalty free
                    license to use, sell, reproduce, prepare derivative works, combine with other
                    works, alter, translate, distribute copies, display, perform, publish, license or
                    sub-license the User Content and your name and likeness provided in connection
                    with such use of your User Content. By posting User Content, you hereby release
                    KeNHA and its agents and employees from any claims that such use, as authorized
                    above, violates any of your rights and you understand that you will not be
                    entitled to any compensation for any use of your User Content.
                </p>
            </div>
        ),
    },
    {
        number: 6,
        title: 'Submission of Ideas',
        summary:
            'Ideas submitted are voluntary, non-confidential, and gratuitous. By submitting, you grant KeNHA broad royalty-free rights to use your ideas without compensation.',
        content: (
            <div className="space-y-4 text-sm leading-relaxed">
                <p className="font-semibold text-black dark:text-white">H. SUBMISSION OF IDEAS:</p>

                <p className="text-gray dark:text-zinc-300">
                    Separate and apart from the User Content you provide, you may submit questions,
                    comments, feedback, suggestions, ideas, improvements, plans, notes, drawings,
                    original or creative materials or other information about KeNHA, our Sites and
                    our products (collectively, &ldquo;Ideas&rdquo;) either through the portal or
                    otherwise. The Ideas you submit are voluntary, non-confidential, gratuitous and
                    non-committal. Please do not send us Ideas if you expect payment or wish to
                    retain ownership or claim rights in them; You must also inform us if you have a
                    pending or registered patent relative to the Idea.
                </p>

                <p className="text-gray dark:text-zinc-300">
                    You represent and warrant that your Idea is not subject to any confidentiality
                    obligations or third party intellectual property encumbrances and that you own
                    and control all of the rights to the Idea and have the authority to grant the
                    rights to KeNHA that you grant herein.
                </p>

                <p className="text-gray dark:text-zinc-300">
                    By submitting your Idea, you grant KeNHA and its designees a worldwide,
                    perpetual, irrevocable, non-exclusive, fully-paid up and royalty free license to
                    use, sell, reproduce, prepare derivative works, combine with other works, alter,
                    translate, distribute copies, display, perform, publish, license or sub-license
                    the Idea and shall be entitled to the unrestricted use and dissemination of Ideas
                    for any purpose, commercial or otherwise, without acknowledgment or compensation
                    to you. By submitting your Idea, you hereby release KeNHA and its agents and
                    employees from any claims that such use violates any of your rights.
                </p>

                <p className="text-gray dark:text-zinc-300">
                    KeNHA shall own exclusive rights, including all intellectual property rights, to
                    any work it creates or has created from the Idea or a similar idea of its own.
                </p>
            </div>
        ),
    },
    {
        number: 7,
        title: 'Links, Indemnification & Disclaimers',
        summary:
            'Rules for linking to the site, your obligation to indemnify KeNHA, and important disclaimers limiting warranties and liability.',
        content: (
            <div className="space-y-4 text-sm leading-relaxed">
                <p className="font-semibold text-black dark:text-white">I. LINKS TO SITES:</p>

                <p className="text-gray dark:text-zinc-300">
                    You are granted a limited, non-exclusive right to create text hyperlinks to the
                    Sites for noncommercial purposes, provided such links do not portray KeNHA in a
                    false, misleading, derogatory or otherwise defamatory manner and provided further
                    that the linking site does not contain any obscene, pornographic, sexually
                    explicit or illegal material or any material that is offensive, harassing or
                    otherwise objectionable. This limited right may be revoked at any time.
                </p>

                <p className="text-gray dark:text-zinc-300">
                    You may not use KeNHA&rsquo;s logo or other proprietary graphics to link to our
                    Sites without our express written permission. Further, you may not use, frame or
                    utilize framing techniques to enclose any KeNHA trademark, logo or other
                    proprietary information, including the images found at the Sites, the content of
                    any text or the layout/design of any page or form contained on a page on the
                    Sites without our express written consent.
                </p>

                <p className="font-semibold text-black dark:text-white">J. INDEMNIFICATION:</p>

                <p className="text-gray dark:text-zinc-300">
                    The User agrees to defend, indemnify, and hold harmless KeNHA, its parent,
                    subsidiary and other affiliated companies, independent contractors, service
                    providers and consultants, and their respective employees, contractors, agents,
                    officers, and directors (&ldquo;KeNHA Indemnitees&rdquo;) from any and all
                    claims, suits, damages, costs, lawsuits, fines, penalties, liabilities, and
                    expenses (including attorneys&rsquo; fees) (&ldquo;Claims&rdquo;) that arise from
                    or relate to the User&rsquo;s use or misuse of the Sites, violation of these
                    Terms, violation of any rights of a third party, any User Content or Ideas you
                    provide, or your conduct in connection with the Sites.
                </p>

                <p className="text-gray dark:text-zinc-300">
                    Notwithstanding the foregoing, this indemnification provision shall not apply to
                    any Claims caused by a KeNHA Indemnitee&rsquo;s sole negligence. KeNHA reserves
                    the right to assume the exclusive defense and control of any matter otherwise
                    subject to indemnification by the User, in which event the User will cooperate in
                    asserting any available defenses.
                </p>

                <p className="font-semibold text-black dark:text-white">K. WARRANTIES; DISCLAIMERS:</p>

                <p className="text-gray dark:text-zinc-300">
                    KeNHA is providing the Sites to the User &ldquo;as is&rdquo; and the User is
                    using the Sites at his or her own risk. To the fullest extent allowable under
                    applicable law, KeNHA disclaims all warranties, whether express or implied,
                    including any warranties that the Sites are merchantable, reliable, available,
                    accurate, fit for a particular purpose or need, non-infringing, free of defects
                    or viruses, able to operate on an uninterrupted basis, that the use of the Sites
                    by the User is in compliance with laws applicable to the User, or that User
                    Information transmitted in connection with the Sites will be successfully,
                    accurately, or securely transmitted or received.
                </p>

                <p className="text-gray dark:text-zinc-300">
                    The materials and information on the Sites may include technical inaccuracies or
                    typographical errors. Notwithstanding the foregoing, none of the disclaimers in
                    this paragraph shall apply to warranties related to personal injury.
                </p>

                <p className="font-semibold text-black dark:text-white">L. NO LIABILITY:</p>

                <p className="text-gray dark:text-zinc-300">
                    Subject to applicable law, including with respect to strict liability for
                    personal injury or non-waivable statutory rights under Kenyan law, in no event
                    shall KeNHA or its officers, directors, employees, shareholders or agents:
                </p>

                <ol className="list-decimal space-y-1 pl-5 text-gray dark:text-zinc-300">
                    <li>
                        Be liable to the User with respect to use of the Sites, the Content or the
                        materials contained in or accessed through the Sites (including without
                        limitation any damages caused by or resulting from reliance by a User on any
                        information obtained from KeNHA), or any damages that result from mistakes,
                        omissions, interruptions, deletion of files or email, errors, defects,
                        viruses, delays in operation or transmission or any failure of performance,
                        whether or not resulting from acts of God, communications failure, theft,
                        destruction or unauthorized access to KeNHA records, programs or services;
                        and
                    </li>
                    <li>
                        Be liable to the User for any indirect, special, incidental, consequential,
                        punitive or exemplary damages, including, without limitation, damages for
                        loss of goodwill, lost profits, loss, theft or corruption of user
                        information, or the inability to use the Sites or any of their features.
                    </li>
                </ol>

                <p className="text-gray dark:text-zinc-300">
                    The User&rsquo;s sole remedy is to cease use of the Sites. If you reside in a
                    jurisdiction other than Kenya, your jurisdiction may not allow the limitation of
                    liability in contracts with consumers, and therefore, some or all of these
                    limitations of liability may not apply to you.
                </p>
            </div>
        ),
    },
    {
        number: 8,
        title: 'Third Party Content & Modifications',
        summary:
            'KeNHA is not responsible for third-party content. The site may be modified or discontinued at any time. Your access can be terminated without notice.',
        content: (
            <div className="space-y-4 text-sm leading-relaxed">
                <p className="font-semibold text-black dark:text-white">
                    M. THIRD PARTY CONTENT, SITES, PRODUCTS AND SERVICES (INCLUDING ADVERTISING AND
                    PROMOTIONS):
                </p>

                <p className="text-gray dark:text-zinc-300">
                    KeNHA may provide third party content on the Sites (including embedded content)
                    or links to third-party web pages, content, applications, products and services,
                    including advertisements and promotions (collectively, &ldquo;Third Party
                    Content&rdquo;) as a service to those interested in this information. We do not
                    control, endorse or adopt any Third-Party Content, including that the inclusion
                    of any link does not imply affiliation, endorsement or adoption by KeNHA of any
                    site or any information contained therein, and can make no guarantee as to its
                    accuracy or completeness. You acknowledge and agree that KeNHA is not responsible
                    or liable in any manner for any Third-Party Content and undertakes no
                    responsibility to update or review such Third-Party Content.
                </p>

                <p className="text-gray dark:text-zinc-300">
                    You agree to use such Third-Party Content contained therein at your own risk.
                    When you visit other sites via Third Party Content, or participate in promotions
                    or business dealings with third parties, you should understand that our terms and
                    policies no longer govern, and that the terms and policies of those third-party
                    sites will now apply. You should review the applicable terms and policies,
                    including privacy and data gathering practices, of any site to which you navigate
                    from our Sites.
                </p>

                <p className="font-semibold text-black dark:text-white">N. MODIFICATIONS TO THE SITES:</p>

                <p className="text-gray dark:text-zinc-300">
                    KeNHA reserves the right to modify or discontinue, temporarily or permanently,
                    the Sites or any features or portions thereof without prior notice. You agree
                    that KeNHA will not be liable for any modification, suspension or discontinuance
                    of the Sites or any part thereof.
                </p>

                <p className="font-semibold text-black dark:text-white">S. TERMINATION:</p>

                <p className="text-gray dark:text-zinc-300">
                    Notwithstanding any of these Terms, KeNHA reserves the right, without notice and
                    in its sole discretion, to terminate your license to use the Sites and to block
                    or prevent your future access to and use of the Sites. KeNHA&rsquo;s failure or
                    delay in taking such actions does not constitute a waiver of its rights to
                    enforce these Terms.
                </p>

                <p className="font-semibold text-black dark:text-white">T. CHANGES:</p>

                <p className="text-gray dark:text-zinc-300">
                    KeNHA reserves the right to change or modify these Terms or any other KeNHA
                    policies related to use of the Sites at any time and at its sole discretion by
                    posting revisions on the Sites. Continued use of the Sites following such changes
                    or modifications to the Terms or other KeNHA policies will constitute acceptance
                    of such changes or modifications.
                </p>
            </div>
        ),
    },
    {
        number: 9,
        title: 'Arbitration & Governing Law',
        summary:
            'Most disputes are resolved through binding arbitration, not court. Kenyan law governs. Class action rights are waived unless you opt out within 30 days.',
        content: (
            <div className="space-y-4 text-sm leading-relaxed">
                <p className="font-semibold text-black dark:text-white">P. ARBITRATION:</p>

                <p className="text-gray dark:text-zinc-300">
                    Please read this section carefully. It affects rights that you may otherwise
                    have. It provides for resolution of most disputes through arbitration instead of
                    court trials and class actions. Arbitration is more informal than a lawsuit in
                    court, uses a neutral arbitrator instead of a judge or jury, and discovery is
                    more limited. Arbitration is final and binding and subject to only very limited
                    review by a court. This arbitration clause shall survive termination of these
                    Terms.
                </p>

                <p className="font-medium text-black dark:text-white">Binding Arbitration:</p>

                <p className="text-gray dark:text-zinc-300">
                    This provision is intended to be interpreted broadly to encompass all disputes or
                    claims arising out of or relating to these Terms, your use of the Sites, and your
                    relationship with us. Any dispute or claim arising out of or relating to these
                    Terms or use of the Sites and your relationship with KeNHA or any subsidiary,
                    parent or affiliate company or companies (whether based in contract, tort,
                    statute, fraud, misrepresentation or any other legal theory) will be resolved by
                    binding arbitration, except that either of us may take claims to small claims
                    court if they qualify for hearing by such a court.
                </p>

                <p className="font-medium text-black dark:text-white">Opt-Out:</p>

                <p className="text-gray dark:text-zinc-300">
                    Notwithstanding the above, you may choose to pursue your claim in court and not
                    by arbitration if you opt out of this arbitration provision within 30 days from
                    the earliest of the date you downloaded, installed, accessed or used the Sites
                    (the &ldquo;Opt Out Deadline&rdquo;) after these Terms have gone into effect. You
                    may opt out of these arbitration procedures by sending us a written notice that
                    you opt out.
                </p>

                <p className="font-semibold text-black dark:text-white">Q. KeNHA LEGAL SERVICES:</p>

                <p className="font-medium text-black dark:text-white">Costs of Arbitration:</p>

                <p className="text-gray dark:text-zinc-300">
                    Each party will bear the fees and expense of its own attorneys, experts,
                    witnesses for filing, preparation and presentation of evidence at the arbitration.
                </p>

                <p className="font-medium text-black dark:text-white">Class Action Waiver:</p>

                <p className="text-gray dark:text-zinc-300">
                    You and we each agree that any proceeding, whether in arbitration or in court,
                    will be conducted only on an individual basis and not in a class, consolidated or
                    representative action. If a court or arbitrator determines in an action between
                    you and us that this class action waiver is unenforceable, the arbitration
                    agreement will be void as to you. If you opt out of the arbitration provision as
                    specified above, this class action waiver provision will not apply to you.
                    Neither you, nor any other customer, can be a class representative, class member,
                    or otherwise participate in a class, consolidated or representative proceeding
                    without having complied with the opt out procedure set forth above. If for any
                    reason a claim proceeds in court rather than through arbitration, you and we each
                    waive any right to a jury trial.
                </p>

                <p className="font-semibold text-black dark:text-white">
                    R. GOVERNING LAW AND JURISDICTION:
                </p>

                <p className="text-gray dark:text-zinc-300">
                    These Terms and use of the Sites are governed by the laws of Kenya, without
                    regard any conflicts. The United Nations Convention on Contracts for the
                    International Sale of Goods shall have no applicability. If the arbitration
                    agreement is ever deemed unenforceable or void, the User irrevocably consents to
                    the exclusive jurisdiction of Kenya, for purposes of any legal action arising out
                    of or related to the use of the Sites or these Terms.
                </p>
            </div>
        ),
    },
    {
        number: 10,
        title: 'Financial Disclosures, Contact & General',
        summary:
            'Forward-looking statements, severability of provisions, and contact information for questions, complaints, or claims regarding the Sites.',
        content: (
            <div className="space-y-4 text-sm leading-relaxed">
                <p className="font-semibold text-black dark:text-white">
                    O. FINANCIAL MATERIAL DISCLOSURES:
                </p>

                <p className="font-medium text-black dark:text-white">Forward-Looking Statements:</p>

                <p className="text-gray dark:text-zinc-300">
                    The Sites, and any documents issued by KeNHA and available through the Sites, may
                    contain statements which constitute forward-looking statements within the meaning
                    assigned within the jurisdiction of Kenya. Forward-looking statements can be
                    identified by the fact that they do not relate strictly to historical or current
                    facts. They often include words such as &ldquo;believes,&rdquo;
                    &ldquo;expects,&rdquo; &ldquo;anticipates,&rdquo; &ldquo;estimates,&rdquo;
                    &ldquo;intends,&rdquo; &ldquo;plans,&rdquo; &ldquo;seeks&rdquo; or words of
                    similar meaning, or future or conditional verbs, such as &ldquo;will,&rdquo;
                    &ldquo;should,&rdquo; &ldquo;could&rdquo; or &ldquo;may.&rdquo;
                </p>

                <p className="text-gray dark:text-zinc-300">
                    Forward-looking statements include statements made as to future operations,
                    costs, capital expenditures, cash flow, product developments, operating
                    efficiencies, sales and earnings estimates or trends and expansion plans,
                    initiatives and projections. These forward-looking statements are based on our
                    expectations as of the date such forward-looking statements are made and are
                    neither predictions nor guarantees of future events or circumstances. Actual
                    future results and trends may differ materially depending on a variety of factors
                    including the risks detailed in the company&rsquo;s filings with the Securities
                    and Exchange Commission, including the &ldquo;Risk Factors&rdquo; section of
                    KeNHA Annual Report on Form 10-K for the most recent fiscal year ended. The
                    company assumes no obligation to update any of these forward-looking statements.
                </p>

                <p className="font-medium text-black dark:text-white">Press Releases:</p>

                <p className="text-gray dark:text-zinc-300">
                    The information contained within press releases issued by KeNHA should not be
                    deemed accurate or current except as of the date the release was posted. KeNHA
                    specifically disclaims any duty to update the information in the press releases.
                    To the extent any information therein is forward-looking it is intended to fit
                    within the safe harbor for forward-looking statements and is subject to material
                    risk.
                </p>

                <p className="font-medium text-black dark:text-white">Third-Party Financial Information:</p>

                <p className="text-gray dark:text-zinc-300">
                    As a service, KeNHA may provide links to third-party websites or services that
                    contain financial or investment information about KeNHA. KeNHA neither regularly
                    monitors nor has control over the content of third parties&rsquo; statements or
                    websites. Accordingly, KeNHA does not endorse or adopt, nor make any
                    representations or warranties whatsoever regarding the accuracy or completeness,
                    of those websites or any information contained therein, including, without
                    limitation, analysts&rsquo; reports and stock quotes. Users visit these websites
                    and use the information contained therein at their own risk.
                </p>

                <p className="font-semibold text-black dark:text-white">U. SEVERABILITY:</p>

                <p className="text-gray dark:text-zinc-300">
                    If any provision of these Terms shall be deemed unlawful, void or for any reason
                    unenforceable, then that provision shall be deemed severable from these Terms and
                    shall not affect the validity and enforceability of any remaining provisions.
                </p>

                <p className="font-semibold text-black dark:text-white">V. CONTACT:</p>

                <p className="text-gray dark:text-zinc-300">
                    Any questions, complaints, or claims regarding the Sites should be directed to:
                </p>

                <div className="rounded-lg border border-gray/15 bg-beige/30 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
                    <p className="font-medium text-black dark:text-white">KeNHA:</p>
                    <p className="text-gray dark:text-zinc-300">
                        Director, Policy, Research and Compliance.
                        <br />
                        prc@kenha.co.ke
                        <br />
                        Block C, 4th Floor, Barabara Plaza,
                        <br />
                        Mazao Road, JKIA Airport,
                        <br />
                        Nairobi Kenya.
                    </p>
                </div>

                <p className="text-center text-xs font-medium text-gray dark:text-zinc-400">
                    Terms And Conditions apply
                </p>
            </div>
        ),
    },
];
